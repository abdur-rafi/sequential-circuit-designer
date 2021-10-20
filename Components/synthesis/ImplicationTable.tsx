import { implicationEntryMap, stringToStringMap } from "./interfaces";
import { ImCross } from "react-icons/im";
import {TiTick} from 'react-icons/ti'
import styles from '../../styles/design.module.scss'
import { useLabelMap } from "./helperFunctions";


const ImplicationTable : React.FC<{
    entries : implicationEntryMap,
    labels  : string[],
    labelMap? : stringToStringMap,
    numberOfOutputVars : number
}>
 = (props)=>{
    let rows : React.ReactNode[] = []; 
    let lastRow : React.ReactNode[] = [];
    let n = props.labels.length;
    for(let i = 1; i < n; ++i){
        let s2 = props.labels[i];
        let cols : React.ReactNode[] = [];
        for(let j = 0; j < i ; ++j){
            let s1 = props.labels[j];
            let txt : React.ReactNode;
            let entry = props.entries[s1][s2];
            if(entry.isCompatible){

                let t = {...props.labelMap}
                // console.log(t);
                
                txt = <TiTick />
                if(entry.dependencies.length > 0){
                    txt = '';
                    entry.dependencies.forEach((e, index) => {
                        let temp = e.split(' ').map(s => useLabelMap(s, props.labelMap)).reduce((prev, curr) =>{
                                console.log(curr);
                                return prev + ' ' + curr;
                            });
                        if(props.labelMap) console.log(props.labelMap['E']);
                        txt += ((index === entry.dependencies.length - 1) ? temp : (temp + '/')).replace(' ', ',')
                    });
                    
                }
            }
            else{
                txt = <ImCross/>;
            }
            cols.push(
                <td key={s1 + s2}>
                    {txt}
                </td>
            )
        }
        rows.push(
            <tr key={s2}>
                <td> {useLabelMap(s2, props.labelMap)} </td>
                {cols}
            </tr>
        )
        lastRow.push(
            <td key = {props.labels[i - 1]}>
                {useLabelMap(props.labels[i - 1], props.labelMap)}
            </td>
        )
    }
    rows.push(
        <tr key = {'!##$#$'}>
            <td></td>
            {lastRow}
        </tr>
    )
    
     
    return(
        <div className={styles.implicationTableContainer}>
            {props.numberOfOutputVars === 0 && <div> states are assumed to be incompatible if number of ouput bit is 0 </div>}
            <table className = {styles.implicationTable}>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    )
}

export default ImplicationTable;
