import { generateGreyCode, getInputCombination } from "./helperFunctions";
import styles from '../../styles/design.module.scss'
import { kMap } from "./interfaces";

const RowColVarLabels : React.FC<{
    kMap : kMap,
    
}> = (props)=>{

    let rem = props.kMap.dims.rem;
    let row = props.kMap.dims.row;
    let col = props.kMap.dims.col;

    return(
        // <thead>
            <tr>
                <th className={styles.rowVars} rowSpan = {Math.pow(2, row) + 2}> {props.kMap.vars.row.map((s, i)=>{
                    // return s
                    return(
                        s.split('').map((s)=>{
                            if(Number.isInteger(parseInt(s))) return(<sub key={s} >{s}</sub>)
                            return s
                        })
                    )
                })} </th>
                <th  className={styles.colVars} colSpan = {Math.pow(2, col) + 1}> {props.kMap.vars.col.map((s, i)=>{
                    return(
                        s.split('').map((s, i)=>{
                            if(Number.isInteger(parseInt(s))) return(<sub key={s} >{s}</sub>)
                            return s
                        })
                    )
                })} 
                </th>
            </tr>
        // </thead>
    )
}

const ColVars : React.FC<{
    colComb : string[]
}> = ({colComb})=>{
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

const Entries  = (rem : string, pulse : string, rowComb : string[], colComb : string[], kMap : kMap)=>{
    return(
        rowComb.map(row=>{
            return(
                <tr key={row}>
                    <th className = {styles.rowLabels} > {row} </th>
                {
                    colComb.map(col=>{
                        return(
                            <td key ={col}>
                                {kMap.map[pulse][rem][row][col]}
                            </td>
                        )
                    })}
                </tr>
            )
            
        })
    )
}


const Table : React.FC<{
    kMap : kMap,
    rem : string,
    pulse : string
}> = (props)=>{
    let colComb = generateGreyCode(props.kMap.dims.col);
    let rowComb = generateGreyCode(props.kMap.dims.row);
    let key = 0;
    return(
        <table key={props.rem}>
            { 
                <caption>
                    <div>
                        {props.kMap.pulseMode && 'pulse: '}
                        {props.kMap.pulseMode && 
                            props.pulse.split('').map(c =>  Number.isInteger(parseInt(c)) ? <sub key={key++}>{c}</sub> : c)
                        }
                    </div>
                    {    
                        props.kMap.vars.rem.length !== 0 &&
                        <div>
                            { props.kMap.vars.rem.map(state=>{
                                return(
                                    state.split('').map(c =>  Number.isInteger(parseInt(c)) ? <sub key={key++}>{c}</sub> : c)
                                )
                                
                            })} = {props.rem} 
                        </div>
                    }{/* {props.kMap.vars.rem.map(s => s)} */}
                </caption>
            }
            <tbody>
                <RowColVarLabels kMap = {props.kMap} />
                <ColVars colComb={colComb} />
                {    
                    Entries(props.rem, props.pulse,rowComb, colComb, props.kMap)
                    // Entries(rem, pulse)
                }
            </tbody>
        </table>
    )
}

const KMap : React.FC<{
    kMap : kMap
}> = (props)=>{

    let rem = props.kMap.dims.rem;
    let row = props.kMap.dims.row;
    let col = props.kMap.dims.col;
    let pulseComb = [''];

    let remComb = generateGreyCode(rem);
    let rowComb = generateGreyCode(row);
    let colComb = generateGreyCode(col);
    if(props.kMap.pulseMode){
        pulseComb = getInputCombination(props.kMap.dims.pulse,'pulse');
    }

    let key = 0;

    return(
        <div className = {styles.kMapContainer}>
            {
                pulseComb.map(p =>{
                    return(
                        rem == 0?
                        <Table key = {key++} kMap = {props.kMap} rem = {''} pulse = {p} /> :
                        remComb.map(rem => <Table key = {rem} kMap = {props.kMap} rem = {rem} pulse = {p} />)
                    )
                })

                // rem === 0 ?
                // Table('') :
                // remComb.map(rem=>{
                //     return(
                //         Table(rem)
                //     )
                // })

            }
        </div>
    )

}

export default KMap;