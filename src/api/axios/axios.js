import axios from "axios"

export default function axiosBox(url, method, data) {
    return axios({
        baseURL: 'http://localhost:8888/HospitalProject',
        method,
        url,
        params: data
    })
}