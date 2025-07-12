import React from 'react';
import './App.css';


class SelcectElement extends React.Component {

    shouldComponentUpdate(nextProps) {
        let shouldUpdate = this.props.dispCodesList !== nextProps.dispCodesList || this.props.dispCodeSelected !== nextProps.dispCodeSelected;
        console.log('SelcectElement shouldComponentUpdate', shouldUpdate);
        return shouldUpdate;
    }

    buildOptions = () => {
        let dispCodesList = null;
        let dispCodesRes = null;
        console.log('buildOptions')
        if (this.props.dispCodesList && this.props.dispCodesList.dispCodes) {
            let dispCodesListName = this.props.dispCodesList.dispCodesList;
            let dispCodeSelected = this.props.dispCodeSelected ? this.props.dispCodeSelected : null;
            dispCodesList = [...this.props.dispCodesList.dispCodes];
            dispCodesRes = dispCodesList.map((dispCode, idx) =>
                <p
                    key={`dispCode${idx}`}
                    id={`${dispCodesListName}_${String(idx).padStart(2, "0")}`}
                    onClick={this.props.handleDispCodesSelectChange}
                    value={dispCode}
                    className={`${dispCodeSelected && dispCodeSelected.findIndex(item => item === dispCode) >= 0 ?
                        'dispcodesdropdown-content2color' :
                        'dispcodesdropdown-content1color'}`}
                >{dispCode}</p>)
        }
        return dispCodesRes && dispCodesRes.length > 0 ? dispCodesRes : null;
    }

    handleSelectChange = async (e) => {

        console.log('handleSelectChange', e.target.value);
    }

    render() {
        console.log('SelcectElement render');
        const dispCodes = this.buildOptions();
        return (dispCodes ?
            <div className="dispcodesdropdown-content">
                {dispCodes}
            </div> : null
        )
    }
}

export default SelcectElement;