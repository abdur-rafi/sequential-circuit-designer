import { implicationEntryMap } from "./interfaces";
import { ImCross } from "react-icons/im";
import {TiTick} from 'react-icons/ti'
import styles from '../../styles/design.module.scss'


const ImplicationTable : React.FC<{
    entries : implicationEntryMap,
    labels  : string[]
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
                
                txt = <TiTick />
                if(entry.dependencies.length > 0){
                    txt = '';
                    entry.dependencies.forEach((e, index) => txt += ((index === entry.dependencies.length - 1) ? e : (e + '/')).replace(' ', ','));
                    
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
                <td> {s2} </td>
                {cols}
            </tr>
        )
        lastRow.push(
            <td key = {props.labels[i - 1]}>
                {props.labels[i - 1]}
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
            <table className = {styles.implicationTable}>
                <tbody>
                    {rows}
                </tbody>
            </table>
        </div>
    )
}

export default ImplicationTable;
