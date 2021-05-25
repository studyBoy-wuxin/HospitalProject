import axios from "axios"

export default function axiosBox(url, method, data) {
    return axios({
        baseURL: 'http://localhost:8888/HospitalMavenProject',
        method,
        url,
        params: data
    })
}