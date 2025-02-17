import axios, { AxiosResponse } from 'axios' 
import { LogInterface } from './main'

// Interface definition. This is needed for a well-formed request body.
interface Attributes {
  name: string;
  'resource-count': number;
  'execution-mode': string;
}
interface DataInterface {
  attributes: Attributes;
  type: string;
}
interface BodyInterface {
  data?: DataInterface; // The value may be nullable
}

// Generic function for interacting with the TFE API
async function terraformApiCall(method: string, projectName: string, organizationName: string, authToken: string, log: LogInterface): Promise<boolean> {
  // Set
  const baseUrl: string = `https://app.terraform.io/api/v2/organizations/${organizationName}/workspaces`
  let body!: BodyInterface;
  let apiUrl!: string;
  let goodStatus!: number;

  switch(method) {
    case 'get': {
      goodStatus = 200;
      apiUrl = baseUrl + `/${projectName}`;
      break;
    }
    case 'post': {
      apiUrl = baseUrl;
      goodStatus = 201;
      body = {
        data: {
          attributes: { 
            name: projectName,
            'resource-count': 0,
            'execution-mode': 'local'
          },
          type: 'workspaces'
        }
      };
      break;
    }
  }

  // Exec
  try {
    const response: AxiosResponse = await axios.request({
      url: apiUrl,
      method: method,
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/vnd.api+json',
      },
      data: body,
    });

    if (response.status === goodStatus) {
      return true;
    } else if (response.status === 404) {
      return false;
    }
  } catch (error) {
    log.error('There was an error when calling the API')
    return false;
  }
  return false;
}

// Logic execution
export const workspaceOperation = async (projectName: string, organizationName: string | undefined, authToken: string | undefined, log: LogInterface): Promise<void> => {
  if (authToken === undefined || organizationName === undefined) {
    log.info('Missing params. Skipping...');
  } else {
    log.info('Checking if workspace exists in TFE...')
    await terraformApiCall('get', projectName, organizationName, authToken, log).then( async (result) => {
      if (result) {
        log.info('The workspace exists. Nothing to do...');
      } else {
        log.info('The workspace does not exist. Creating...');
        await terraformApiCall('post', projectName, organizationName, authToken, log).then((result) => {
          if (result) {
            log.info('Workspace created.');
          } else {
            log.info('Something went wrong.');
          }
        })
      }
    })
  }
}
