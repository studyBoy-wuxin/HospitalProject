import axiosBox from "./axios/axios"


export const GET = (url) => { return axiosBox(url, 'GET') }

export const POST = (url, data) => { return axiosBox(url, "post", data) }