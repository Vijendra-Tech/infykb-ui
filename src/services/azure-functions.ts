/**
 * Service for interacting with Azure Functions
 */

// Configuration for Azure Functions
const AZURE_FUNCTION_BASE_URL = process.env.NEXT_PUBLIC_AZURE_FUNCTION_URL || 'https://your-function-app-name.azurewebsites.net';
const AZURE_FUNCTION_KEY = process.env.AZURE_FUNCTION_KEY || '';

/**
 * Interface for ingested data information
 */
export interface IngestedDataInfo {
  id: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  size: number;
  status: 'processed' | 'processing' | 'failed';
  metadata?: Record<string, any>;
}

/**
 * Fetch ingested data information from Azure Function
 * @returns Promise with array of ingested data information
 */
export async function fetchIngestedData(): Promise<IngestedDataInfo[]> {
  return callAzureFunction('GetIngestedData', {});
}

/**
 * Generic function to call Azure Functions
 * @param functionName Name of the Azure function to call
 * @param data Data to send to the function
 * @returns Promise with unknown data
 */
export async function callAzureFunction(functionName: string, data: Record<string, unknown>): Promise<IngestedDataInfo[]> {
  try {
    // Build the URL with function key if available
    let url = `${AZURE_FUNCTION_BASE_URL}/api/${functionName}`;
    if (AZURE_FUNCTION_KEY) {
      url += `?code=${AZURE_FUNCTION_KEY}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching ingested data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as IngestedDataInfo[];
  } catch (error) {
    console.error('Failed to fetch ingested data:', error);
    throw error;
  }
}

/**
 * Fetch details for a specific ingested document
 * @param documentId ID of the document to fetch
 * @returns Promise with document details
 */
export async function fetchIngestedDocumentDetails(documentId: string): Promise<IngestedDataInfo> {
  try {
    // Build the URL with function key if available
    let url = `${AZURE_FUNCTION_BASE_URL}/api/GetDocumentDetails/${documentId}`;
    if (AZURE_FUNCTION_KEY) {
      url += `?code=${AZURE_FUNCTION_KEY}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error fetching document details: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data as IngestedDataInfo;
  } catch (error) {
    console.error(`Failed to fetch document details for ID ${documentId}:`, error);
    throw error;
  }
}

/**
 * Delete an ingested document
 * @param documentId ID of the document to delete
 * @returns Promise with success status
 */
export async function deleteIngestedDocument(documentId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Build the URL with function key if available
    let url = `${AZURE_FUNCTION_BASE_URL}/api/DeleteDocument/${documentId}`;
    if (AZURE_FUNCTION_KEY) {
      url += `?code=${AZURE_FUNCTION_KEY}`;
    }
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Error deleting document: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Failed to delete document with ID ${documentId}:`, error);
    throw error;
  }
}
