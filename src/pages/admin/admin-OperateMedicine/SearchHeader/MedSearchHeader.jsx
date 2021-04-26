import React, { Component } from 'react';
import { GET } from '../../../../api/index.jsx'

class MedSearchHeader extends Component {

    componentDidMount() {
        GET('/MedicineController/findAllType')
            .then(resp => console.log(resp.data))
            .catch(err => console.log(err.message))
    }

    render() {
        return (
            <div>
                aaa
            </div>
        );
    }
}

export default MedSearchHeader;