import { generateGreyCode } from "./helperFunctions";
import styles from '../../styles/design.module.scss'
import { kMap } from "./interfaces";

const KMap : React.FC<{
    kMap : kMap
}> = (props)=>{

    let rem = props.kMap.dims.rem;
    let row = props.kMap.dims.row;
    let col = props.kMap.dims.col;

    let remComb = generateGreyCode(rem);
    let rowComb = generateGreyCode(row);
    let colComb = generateGreyCode(col);
    
    
    const RowColVarLabels = ()=>{
        return(
            // <thead>
                <tr>
                    <th className={styles.rowVars} rowSpan = {Math.pow(2, row) + 2}> {props.kMap.vars.row.split('').map((s, i)=>{
                        if(i % 2) return(<sub key={s} >{s}</sub>)
                        return s
                    })} </th>
                    <th  className={styles.colVars} colSpan = {Math.pow(2, col) + 1}> {props.kMap.vars.col.split('').map((s, i)=>{
                        if(i % 2) return(<sub key={s} >{s}</sub>)
                        return s
                    })} 
                    </th>
                </tr>
            // </thead>
        )
    }

    const ColVars = ()=>{
        return(
            <tr>
                <th style={{border : 'none'}}> 
                </th>
            {
                colComb.map(col=>{
                    return(
                        <th key={col} className = {styles.colLabels}>
                            {col}
                        </th>
                    )
                })
            }
            </tr>
        )
    }

    const Entries = (rem : string)=>{
        return(
            rowComb.map(row=>{
                return(
                    <tr key={row}>
                        <th className = {styles.rowLabels} > {row} </th>
                    {
                        colComb.map(col=>{
                            return(
                                <td key ={col}>
                                    {props.kMap.map[rem][row][col]}
                                </td>
                            )
                        })}
                    </tr>
                )
                
            })
        )
    }
    
    const Table = (rem : string)=>{
        let key = 0;
        return(
            <table key={rem}>
                { props.kMap.dims.rem !== 0 &&
                <caption> {props.kMap.vars.rem.split('').map(c=> Number.isInteger(parseInt(c)) ? <sub key={key++}>{c}</sub> : c)} = {rem} </caption>
                }
                <tbody>
                    <RowColVarLabels />
                    <ColVars />
                {    
                    Entries(rem)
                }
                </tbody>
            </table>
        )
    }
    
    

    return(
        <div className = {styles.kMapContainer}>
            {
                rem === 0 ?
                Table('') :
                remComb.map(rem=>{
                    return(
                        Table(rem)
                    )
                })

            }
        </div>
    )

}

export default KMap;