import React from 'react'
import { useState } from 'react'
import FuncionEquation from './FunctionEquation';
import { generateKMap, simplifyFunction, truthTableFromMinterms } from './helperFunctions';
import { circuitMode, kMap, simplifyFunctionReutnType, tabulationGroupItem, truthTable } from './interfaces';
import KMap from './KMapCanvas';
import PrimeImplicants from './PrimeImplicants';
import styles from '../../styles/minimizefunction.module.scss'
import SecondTable from './tabulationSecondTable';

const TabualationTableCell : React.FC<{
    rowIndex : number,
    columnIndex : number,
    items : tabulationGroupItem[]
}> = (props)=>{
    let indexes : number[] = [];
    for(let i = 0; i <= props.columnIndex; ++i){
        indexes.push(i + props.rowIndex);
    }
    let afterRows : React.ReactNode[] = [];
    for(let i = 1; i < props.items.length; ++i){
        afterRows.push(
            <tr key = {i}>
                <td style = {{
                    color : props.items[i].taken ? 'black' : 'red'
                }}>
                    {
                        props.items[i].comb
                    }
                </td>
                <td>
                    {
                       props.items[i] && Array.from(props.items[i].minterms).map((t, index) => parseInt(t, 2) + ((index === props.items[i].minterms.size - 1) ? '' : ','))
                    }
                </td>
            </tr>
        )
    }
    return(
        
            <table className = {styles.cellTableContainer}>
                <thead>
                    <tr>
                        
                        <th>
                            {props.columnIndex === 0 ? 'cell' : 'from cells'}
                        </th>
                        <th>
                            input combination
                        </th>
                        <th>
                            minterms
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td rowSpan = {props.items.length === 0? 1 : props.items.length}>
                            {indexes.map((t, i) => t + ((i === indexes.length - 1) ? '' : ','))}
                        </td>
                        <td style = {{
                            color : (props.items.length > 0 && !props.items[0].taken) ? 'red' : 'black'
                        }}>
                            {
                                props.items.length > 0 && props.items[0].comb
                            }
                        </td>
                        <td>
                            {
                                props.items.length > 0 && 
                                props.items[0].minterms && Array.from(props.items[0].minterms).map((t, i) => parseInt(t, 2) + ((i === props.items[0].minterms.size - 1) ? '' : ','))
                            }
                        </td>
                    </tr>
                    {afterRows}

                </tbody>
            </table>
        
    )
}

const ColumnTable : React.FC<{
    colums : tabulationGroupItem[][],
    columnIndex : number,
    vars : string[]
}> = (props)=>{
    let key = 0;
    return(
        <div className = {styles.columnTableContainer}>
            <table className = {styles.columnTable}>
                <thead>
                    <tr>
                        <th>
                            {`Step: ${props.columnIndex + 1}`}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.colums.map((item, index)=>{
                            return(
                                <tr key = {key++}>
                                    <td>
                                        <TabualationTableCell columnIndex = {props.columnIndex} items = {item} rowIndex = {index} />
                                    </td>
                                </tr>
                            )
                        })
                    }
                </tbody>
                {/* {
                    props.colums.map( (item, index) => <TabualationTableCell key = {key++} rowIndex = {index} columnIndex = {props.columnIndex} items = {item} />)
                } */}
            </table>
        </div>
    )
}

const TabulationTable : React.FC<{
    allGroups : tabulationGroupItem[][][],
    vars : string[]
}> = (props)=>{

    let TableHeader = ()=>{
        return(
            <thead>
                <tr>
                    {
                        props.allGroups.map((val, index)=>{
                            return(
                                <th key = {index}>
                                    {
                                        props.vars.map(v => v+' ')
                                    }  
                                </th>
                            )
                        })
                    }
                </tr>
            </thead>
        )
    }
    let mx = props.allGroups[0].length;
    
    let TableBody = ()=>{
        let key = 0;
        let row : React.ReactNode[] = [];
        for(let i = 0; i < mx;++i){
            let columns : React.ReactNode[] = [];
            for(let j = 0; j < props.allGroups.length; ++j){
                if(i < props.allGroups[j].length){
                    columns.push(
                        <td key = {key++}>
                            {
                                <TabualationTableCell items = {props.allGroups[j][i]} rowIndex = {i} columnIndex = {j}  />
                            }
                        </td>
                    )
                }
            }
            row.push(
                <tr key = {key++}>
                    {columns}
                </tr>
            )
        }
        return(
            <tbody>
                {row}
            </tbody>
        )
    }

    return(
        <div className = {styles.tabulationTableContainer}>
            {/* <table className = {styles.tabulationTable}>
                <TableHeader/>
                <TableBody/>
            </table> */}
            {
                props.allGroups.map((item, index)=><ColumnTable columnIndex = {index} colums = {item} vars = {props.vars} />)
            }
        </div>
    )
}


const MinimizeFunction : React.FC<{
    useTabulaion? : boolean
}> = (props)=>{
    
    // const [numberOfInputVars, setNumberOfInputVars] = useState<number>(3);
    const [functionTerms, setFunctionTerms] = useState<string>('');
    const [dontCares, setDontCares] = useState<string>('');
    const [variables, setVariables] = useState<string>('');
    const [error, setError] = useState<{type : 'vars' | 'terms' | 'dontCares',message : string} | null>(null);
    // const [truthTable, setTruthTable] = useState<truthTable | null>(null);
    const [kMap, setKMap] = useState<kMap | null>(null);
    const [implicants, setImplicants] = useState<simplifyFunctionReutnType|null> (null);

    const [sumOfMinterm, setSumOfMinterm] = useState<boolean>(true);
    const [varsArr, setVarsArr] = useState<string[]>([]);
    const [minterms , setMinterms] = useState<number[]>([]);

    let regex = /\s*,\s*/;


    const getRemainingTerms = (terms : number[], dontCares : number[], max : number)=>{
        let remTerms : number[] = [];
        for(let i = 0; i <= max; ++i){
            if(terms.indexOf(i) === -1 && dontCares.indexOf(i) === -1){
                remTerms.push(i);
            }
        }
        return remTerms;
    }

    const validate =  () =>{
        const doesContainOtherThandigits = (l : string)=>{
            for(let i = 0; i < l.length; ++i){
                if(!Number.isInteger(parseInt(l[i]))){
                    return true;
                }
            }
            return false;
        }
        let vars = variables.trim().split(regex);
        console.log(vars);
        let n = vars.length;
        if(variables.trim().length === 0){
            setError({
                type : 'vars',
                message : 'no variables given'
            })
            return false;
        }
        if(functionTerms.trim().length === 0){
            setError({
                type : 'terms',
                message : 'no terms given'
            })
            return false
        }
        for(let i = 0; i < n; ++i){
            if(vars[i].length === 0 || vars[i].split(/\s/).length > 1){
                setError({
                    type : 'vars',
                    message : 'variables should contain no whitespace and be separated by comma'
                })
                return false;
            }
        }
        
        let maxTermNumber = (1 << n) - 1;
        let terms = functionTerms.trim().split(regex);
        // console.log(terms);
        let termsSet = new Set<number>();
        for(let i = 0; i < terms.length;++i){
            let t = parseInt(terms[i]);
            if(doesContainOtherThandigits(terms[i])){
                setError({
                    type : 'terms',
                    message : 'terms should be interger'
                })
                return false;
            }
            if(t > maxTermNumber){
                setError({
                    type : 'terms',
                    message : `term(s) exceed ${maxTermNumber}` 
                })
                return false;
            }
            termsSet.add(t);
        }
        let dontCareTerms : string[] = [];
        if(dontCares.trim().length !== 0){

            dontCareTerms = dontCares.trim().split(regex);
            for(let i = 0; i < dontCareTerms.length;++i){
                let t = parseInt(dontCareTerms[i]);
                if(doesContainOtherThandigits(dontCareTerms[i])){
                    setError({
                        type : 'dontCares',
                        message : 'terms should be integer'
                    })
                    return false;
                }
                if(t > maxTermNumber){
                    setError({
                        type : 'dontCares',
                        message : `term(s) exceed ${maxTermNumber}` 
                    })
                    return false;
                }
                if(termsSet.has(t)){
                    setError({
                        type : 'dontCares',
                        message : `duplicate entries in terms and don't cares` 
                    })
                    return false;
                }
            }
        }

        let termsNumber = terms.map(term => parseInt(term));
        let dontCaresNumber : number[] = [];
        if(dontCares.trim().length !== 0){
            dontCaresNumber = dontCareTerms.map(term => parseInt(term));
        }

        if(!sumOfMinterm){
            termsNumber = getRemainingTerms(termsNumber, dontCaresNumber,maxTermNumber);
        }
        termsNumber.sort((a, b) => a - b);
        setMinterms(termsNumber);

        truthTableFromMinterms(termsNumber, vars, dontCaresNumber, 'synch')
        .then(async tr =>{
            let k = await generateKMap(tr,'synch' );
            let r = simplifyFunction(tr, 'synch', vars.length, true);
            setVarsArr(vars);
            setImplicants(r);
            setKMap(k[0]);
        })



        return true;

    }

    const resetError = (type : 'vars' | 'terms' | 'dontCares')=>{
        if(error && error.type === type){
            setError(null);
        }
    }

    return(
        <div className = {styles.root}>
            <div className = {styles.introContainer} >
                <h1>
                    Minimize / Simplify Function
                </h1>
                <div>
                Provide the function as sum of minterms or product of maxterms. The function is then minimized using {props.useTabulaion ? 'Tabulation Method' : 'KMap'}.
                Additionally all Prime Implicants and essential prime implicants are provided</div>
            </div>
            <div className = {styles.inputsContainer}>

              
                <div className = {styles.variablesInputContainer} >
                    <label>Variables:</label>
                    <input type = 'text' onChange = {(e)=>{
                            setVariables(e.target.value);
                            resetError('vars')
                        }} value = {variables} />

                    {error && error.type === 'vars' &&
                        <div className = {styles.errorTextContainer} >
                            {error.message}
                        </div>
                    }
                </div>
                <div className = {styles.optionsContainer}>
                    <select onChange = {(e)=>{
                            if(e.target.value === 'sum of minterms'){
                                setSumOfMinterm(true);
                            }
                            else{
                                setSumOfMinterm(false);
                            }
                        }} defaultValue = {'sum of minterms'} >
                            <option> sum of minterms </option>
                            <option> product of maxterms </option>
                        </select>
                </div>
                <div className = {styles.termContainer}>
                        {/* <select onChange = {(e)=>{
                            if(e.target.value === 'sum of minterms'){
                                setSumOfMinterm(true);
                            }
                            else{
                                setSumOfMinterm(false);
                            }
                        }} defaultValue = {'sum of minterms'} >
                            <option> sum of minterms </option>
                            <option> product of maxterms </option>
                        </select> */}
                    
                    <label> Terms </label>    
                    <input type = 'text' onChange = {(e)=>{
                            setFunctionTerms(e.target.value);
                            resetError('terms')
                        }} value = {functionTerms} />
                    {error && error.type === 'terms' &&
                        <div className = {styles.errorTextContainer} >
                            {error.message}
                        </div>
                    }
                </div>
                <div className = {styles.dontCareContainer}>
                    <label> don't cares: </label>
                    <input type = 'text' onChange = {(e)=>{
                            setDontCares(e.target.value);
                            resetError('dontCares');
                        }} value = {dontCares} />
                    {error && error.type === 'dontCares' &&
                        <div className = {styles.errorTextContainer} >
                            {error.message}
                        </div>
                    }
                </div>
                <div className = {styles.buttonContainer} >
                    <button onClick = {()=>validate()}> {props.useTabulaion ? 'Generate Table' : 'Generate KMap'} </button>
                </div>

            </div>
            
            <div className = {styles.mapContainer}>
                {
                   !props.useTabulaion && implicants && kMap && <KMap implicants = {implicants} kMap = {kMap} />
                    
                }
                {
                    props.useTabulaion && implicants && 
                    <div>
                        <TabulationTable allGroups = {implicants[''].groupsPerStep!} vars = {varsArr} />
                        <SecondTable implicants={implicants} vars={varsArr} pulse={''} minterms={minterms}  />
                    </div>
                }
                {
                    implicants &&
                    <div className = {styles.equationAndImplicationsContainer}>
                        <FuncionEquation circuitMode='synch' numberOfInputs = {0} vars = {varsArr} functionName = {'f'} r = {implicants} />
                        <PrimeImplicants circuitMode = 'synch' numberOfInputs = {varsArr.length} vars = {varsArr} r = {implicants} />
                    </div>
                }
                
                {
                }
                
            </div>
        </div>
    )
}

export default MinimizeFunction;