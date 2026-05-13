import {createDataProvider, CreateDataProviderOptions} from "@refinedev/rest";
import {BACKEND_BASE_URL} from "@/constants";
import {ListResponse} from "@/types";
import {HttpError} from "@refinedev/core";

if (!BACKEND_BASE_URL) {
  throw new Error("BACKEND_BASE_URL requires BACKEND_BASE_URL");
}
const buildHttpError = async(response: Response): Promise<HttpError> => {
    let message = "Request failed.";
    try {
        const payload = (await response.json()) as {message?: string}

        if(payload?.message) message = payload.message;
    }catch(e) {
        //IGNORE ERRORS
    }
    return {
        message,
        statusCode: response.status,
    }
}
const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({resource}) => resource,
    buildQueryParams: async({resource, pagination, filters, sorters}) => {

  const page = pagination?.currentPage ?? 1;
  const pageSize = pagination?.pageSize ?? 10;

  const params: Record<string, string|number> = {page, limit: pageSize};
      if (sorters?.length) {
            const { field, order } = sorters[0];
            params.sortBy = String(field);
            params.sortOrder = order;
          }

  filters?.forEach((filter) => {
    const field = 'field' in filter ? filter.field : '';
    const value = String(filter.value);
    if(resource === "subjects"){
      if(field === "department") params.department = value;
      if(field === "name" || field === "code") params.search = value;
  }
})
  return params;
      },
    mapResponse: async (response) => {
      if(!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json();
      return payload.data ?? [];
    },
    getTotalCount: async (response) => {
        if(!response.ok) throw await buildHttpError(response);
      const payload: ListResponse = await response.clone().json()
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    }
  }
}

const {dataProvider} = createDataProvider(BACKEND_BASE_URL, options);
export {dataProvider};