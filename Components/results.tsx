import React from "react";
import { Edge, StateNode } from "./canvasInterfaces";
import styles from '../styles/design.module.scss'

interface excitationInterface{
    map : {
        [state : string] : {
            [inpComb : string] : string
        }
    },
    dims : {
        row : number,
        col : number
    },
    stateIndex : number,
    stateLabels : string,
    inputLabels : string
    
    
}
interface nextStateMap {
    [state : string] : {
        [inpComb : string] : {
            state : string,
            output : string
        }
    }
}
interface kMap{
    map :{
        [remComb : string] : {
            [rowComb : string] : {
                [columnComb : string] : string
            }
        }
    },
    dims : {
        rem : number
        row : number,
        col : number
    },
    functionName : string,
    vars : {
        rem : string,
        row : string,
        col : string
    }
}
interface truthTable{
    table : {
        [inpComb : string] : string
    },
    dims : number,
    functionName : string,
    vars : string
}

interface tabulationGroupItem{
    comb : string,
    taken : boolean,
    minterms : Set<string>
}

function getRequiredBitForStates(noOfStateNodes : number){
    let c = 0;
    let n = noOfStateNodes;
    while(Math.pow(2, c) < n){
        c++;
    }
    return c;
}

function getBinRepresentation(stateNodes : StateNode[]) : Map<string, string>{
    let n = stateNodes.length;
    let c = getRequiredBitForStates(n);
    let m = new Map<string, string>();
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < c){
            curr = '0' + curr;
        }
        m.set(stateNodes[i].label,curr);
    }
    return m;
}

export function getInputCombination(d : number) : string[]{
    let n = Math.pow(2,d);
    let inps : string[] = []
    for(let i = 0; i < n; ++i){
        let curr = i.toString(2);
        while(curr.length < d){
            curr = '0' + curr;
        }
        inps.push(curr);

    }
    return inps;
}

function getNextStateMap(stateNodes : StateNode[], numberOfInpVars : number) : nextStateMap{
    let map : nextStateMap = {};
    let inpComb = getInputCombination(numberOfInpVars);
    stateNodes.forEach(s=>{
        map[s.label] = {}
        inpComb.forEach(comb=>{
            let to = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0].edges[0].to;

            map[s.label][comb] = {
                state : to.originNode.label,
                output : to.output
            }
        })
    })
    return map;
}

function getLabels(n : number, t : string): string{
    let s = '';
    for(let i = 0; i < n; ++i)
        s += t + i;
    return s;
}

function getExcitations(stateNodes : StateNode[] , binMap : Map<string, string>, numberOfInputVar : number, latchMap : {[key: string]: string}) : excitationInterface[]{
    let excitations : excitationInterface[] = [];
    let numberOfStateBits = getRequiredBitForStates(stateNodes.length);
    let inpComb = getInputCombination(numberOfInputVar);
    for(let i = 0; i < numberOfStateBits; ++i){
        excitations.push({map : {}, 
            dims : {
                row : numberOfStateBits,
                col : numberOfInputVar
            },
            stateIndex : i,
            stateLabels : getLabels(numberOfStateBits, 'y'),
            inputLabels : getLabels(numberOfInputVar, 'x')
        });
        stateNodes.forEach(s =>{
            let currStateLabel = s.label;
            let currBin = binMap.get(currStateLabel);
            excitations[i].map[currBin!] = {}
            inpComb.forEach(comb=>{
                let nxtStateLabel = s.ioNodes.filter(ioNode => ioNode.inputComb === comb)[0].edges[0].to.originNode.label;
                let nextBin = binMap.get(nxtStateLabel);
                if(!nextBin || !currBin) return;
                excitations[i].map[currBin][comb] = latchMap[ currBin[i] + nextBin[i] ];
            })
        })
    }
    return excitations;
}

function truthTablesFromExcitation(excitation : excitationInterface, numberOfVars : number, fDim : number, pair : boolean, lathcLabel : string) : truthTable[]{
    let inpCombs = getInputCombination(numberOfVars);
    let tTable : truthTable[] = [{table : {}, dims : numberOfVars,functionName : '', vars : excitation.stateLabels + excitation.inputLabels}];
    if(pair) tTable.push({table : {}, dims : numberOfVars, functionName : '', vars : excitation.stateLabels + excitation.inputLabels});
    inpCombs.forEach(comb => {
        let f = comb.slice(0, fDim);
        let s = comb.slice(fDim);
        let r;
        try{

            r = excitation.map[f][s];
        }
        catch(e){

        }
        tTable[0].table[comb] = r ? r[0] : 'd'; 
        tTable[0]['functionName'] = lathcLabel[0] + excitation.stateIndex; 
        
        if(pair){
            tTable[1].table[comb] = r ? r[1] : 'd';
            tTable[1]['functionName'] = lathcLabel[1] + excitation.stateIndex; 
        }
    })
    return tTable;
    
}

function generateKMap(truthTable : truthTable, numberOfTotalVars : number) : kMap{
    if(numberOfTotalVars < 5){
        let row = Math.floor(numberOfTotalVars / 2);
        let col = numberOfTotalVars - row;
        let rowComb = getInputCombination(row);
        let colComb = getInputCombination(col);
        let kMap : kMap = {
            map : {},
            dims : {
                rem : 0,
                row : row,
                col : col
            },
            functionName : truthTable.functionName,
            vars : {
                rem : '',
                row : truthTable.vars.slice(0, 2 * row),
                col : truthTable.vars.slice( 2 * row)
            }
        };
        kMap.map[''] = {}
        
        rowComb.forEach(rcomb=>{
            kMap.map[''][rcomb] = {}
            colComb.forEach(ccomb=>{
                kMap.map[''][rcomb][ccomb] = truthTable.table[rcomb + ccomb];
            })
        })
        return kMap;
    }
    else{
        
        let rem = numberOfTotalVars - 4;
        let remCombs = getInputCombination(rem);
        let comb = getInputCombination(4);

        let kMap : kMap = {
            map : {},
            dims : {
                rem : rem,
                row : 2,
                col : 2
            },
            functionName : truthTable.functionName,
            vars : {
                rem : truthTable.vars.slice(0, 2 * rem),
                row : truthTable.vars.slice(2 * rem, 2 * rem + 4),
                col : truthTable.vars.slice(-4)
            }
        };

        remCombs.forEach(remComb=>{
            let tTable : truthTable = {
                table : {},
                dims : numberOfTotalVars,
                functionName : truthTable.functionName,
                vars : truthTable.vars.slice(-4)
            };
            comb.forEach(c=>{
                tTable.table[c] = truthTable.table[remComb + c];
            })
            kMap.map[remComb] = generateKMap(tTable, 4).map[''];
        })
        return kMap;
    }
}

function generateGreyCode(nBit : number) : string[]{
    if(nBit < 1) return [];
    if(nBit == 1){
        return ['0', '1']
    }
    let pr = generateGreyCode(nBit - 1);
    let prRev = [...pr].reverse();
    pr = pr.map(p=>'0'+p);
    prRev = prRev.map(p=>'1' + p);
    return [...pr, ...prRev];
}

function Tabulation(){

}

function count1(s : string) : number{
    let c = 0;
    for(let i = 0; i < s.length; ++i){
        if(s[i] == '1') c++;
    }
    return c;
}

function countDifference(s1 : string, s2 : string): number{
    let diff = 0;
    for(let i = 0; i < s1.length; ++i){
        if(s1[i] != s2[i])
            ++diff;
    }
    return diff;
}

function mergeComb(s1 : string, s2 : string) : string{
    let r = '';
    for(let i = 0; i < s1.length; ++i){
        if(s1[i] !== s2[i]){
            r += '_'
        }
        else r += s1[i];
    }
    return r;
}

function simplifyFunction(truthTable : truthTable) : {
    EPIs : tabulationGroupItem[],
    PIs : tabulationGroupItem[],
    selectedPIs : tabulationGroupItem[]
}   
{
    let inpComb = getInputCombination(truthTable.dims);
    let nonZeroinpComb = inpComb.filter(comb=>truthTable.table[comb] != '0');
    let groups : tabulationGroupItem[][] = [];
    for(let i = 0; i < truthTable.dims; ++i){
        let item : tabulationGroupItem[] = [];
        for(let j = 0; j < nonZeroinpComb.length; ++j){
            let comb = nonZeroinpComb[j];
            if(count1(comb) === i){
                item.push({
                    comb : comb,
                    taken : false,
                    minterms : new Set<string>().add(comb)
                })
            }
        }
        groups.push(item);
    }
    let notTaken : tabulationGroupItem[] = [];
    let notTakenSet : Set<string>  = new Set<string>();
    // console.log(groups);
    for(let i = 0; i < truthTable.dims; ++i){
        let nGroups : tabulationGroupItem[][] = [];
        for(let j = 0; j + 1 < groups.length; ++j){
            let item : tabulationGroupItem[] = [];
            let itemSet : Set<string> = new Set<string>();
            let curr = groups[j];
            let next = groups[j + 1];
            curr.forEach(c =>{
                next.forEach(n =>{
                    if(countDifference(c.comb, n.comb) === 1){
                        let merged = mergeComb(c.comb, n.comb);
                        if(!itemSet.has(merged)){
                            item.push({
                                comb : mergeComb(c.comb, n.comb),
                                minterms : new Set([...c.minterms, ...n.minterms]),
                                taken : false
                            })
                            itemSet.add(mergeComb(c.comb, n.comb));
                        }
                        c.taken = true;
                        n.taken = true;
                    }
                })
            })
            nGroups.push(item);
        }
        groups.forEach(g=>{
            g.forEach(i =>{
                if(!i.taken && !notTakenSet.has(i.comb)){
                    notTaken.push(i);
                    notTakenSet.add(i.comb);
                }
            })
        })
        groups = nGroups;
    }

    let coveringMap : Map<string, tabulationGroupItem[]> = new Map<string, tabulationGroupItem[]>();
    let oneMinterms = inpComb.filter(comb => truthTable.table[comb] == '1');
    // console.log(oneMinterms);
    oneMinterms.forEach(m=>coveringMap.set(m, []))
    notTaken.reverse();
    notTaken.forEach(t=>{
        t.minterms.forEach(minterm => {

            if(coveringMap.has(minterm)){
                let arr = coveringMap.get(minterm);
                if(arr){
                    arr.push(t);
                    coveringMap.set(minterm, arr);
                }
            }
        })
    })
    let epi : tabulationGroupItem[] = []
    let epiSet : Set<string> = new Set<string>();
    for(let i = 0; i < oneMinterms.length; ++i){
        let arr = coveringMap.get(oneMinterms[i]);
        if(arr){
            if(arr.length === 1){
                if(!epiSet.has(arr[0].comb)){
                    epi.push(arr[0]);
                    epiSet.add(arr[0].comb);
                    arr[0].minterms.forEach(m => coveringMap.delete(m));
                }
            }
        }
    }
    let remPIs : tabulationGroupItem[] = [];
    // console.log(epi);
    notTaken.forEach(nt =>{
        if(epiSet.has(nt.comb)) return;
        let f  = false;
        nt.minterms.forEach(mt=>{
            if(coveringMap.has(mt)){
                if(!f){
                    remPIs.push(nt);
                    f = true;
                }
                coveringMap.delete(mt);
            }
        })
    })

    // console.log(epi, remPIs);

    return{
        EPIs : epi,
        PIs : notTaken,
        selectedPIs : [...epi, ...remPIs ]
    }
    



    // console.log(coveringMap);

    // console.log(notTaken);
}

function getLiteral(comb : string, vars : string): string{
    let r = '';
    for(let i = 0; i < comb.length; ++i){
        if(comb[i] == '_')
            continue;
        else if(comb[i] == '0'){
            r += vars.slice(2 * i, 2 * i + 2) + "'";
        }
        else r += vars.slice(2 * i, 2 * i + 2);
    }
    if(r == '') return '1';
    return r;
}

function stateMinimization(stateNodes : StateNode[], nextStateMap : nextStateMap, numberOfInputVars : number){
    let separator = ' ';
    let inpComb = getInputCombination(numberOfInputVars);

    const combineStateLabels = (l1 : string, l2 : string) : string =>{
        if(l1 < l2) return l1 + separator + l2;
        return l2 + separator + l1; 
    }
    const dependency = (state1 : string, state2 : string) : string[] =>{
        let arr : string[] = [];
        inpComb.forEach(comb=>{
            arr.push(combineStateLabels(nextStateMap[state1][comb].state, nextStateMap[state2][comb].state));
        })
        let currComb = combineStateLabels(state1, state2);
        arr = arr.filter(c => c !== currComb);
        return arr;
    }

    let equivalents : Set<string> = new Set<string>();

    let states = stateNodes.map(s => s.label);
    for(let i = 0; i < states.length; ++i){
        for(let j = i + 1; j < states.length; ++j){
            let dependentOn = dependency(states[i], states[j]);
            if(dependentOn.length === 0){
                equivalents.add(combineStateLabels(states[i], states[j]));
            }
            else{
                
            }
        }
    }
}

const SRMap = {
    '00' : '0d',
    '01' : '10',
    '10' : '01',
    '11' : 'd0'
}
const JKMap = {
    '00' : '0d',
    '01' : '1d',
    '10' : 'd1',
    '11' : 'd0'
}
const DMap = {
    '00' : '0',
    '01' : '1',
    '10' : '0',
    '11' : '1'
}
const TMap = {
    '00' : '0',
    '01' : '1',
    '10' : '1',
    '11' : '0'
}

const Design : React.FC<{
    stateNodes : StateNode[],
    edges : Edge[],
    numberOfInpVar : number,
    changeSynthesis : (b : boolean) => void
}> = (props)=>{

    let stateVars = getRequiredBitForStates(props.stateNodes.length) ;
    let numberOfVars = stateVars + props.numberOfInpVar;
    const binRep = getBinRepresentation(props.stateNodes);
    const excitations = getExcitations(props.stateNodes, binRep, props.numberOfInpVar,SRMap);
    const nextStateMap = getNextStateMap(props.stateNodes, props.numberOfInpVar);
    let truthTables : truthTable[] = [];
    excitations.forEach(e=> truthTables.push(...truthTablesFromExcitation(e, numberOfVars, stateVars,true, 'SR')));
    let kMaps : kMap[] = [];
    truthTables.forEach(t=>kMaps.push(generateKMap(t,numberOfVars)));
    // let i = 0;
    return (
        <div className={styles.synthesisContainer}>
            <details>
                <summary>State Table</summary>
                <StateTable nextStateMap = {nextStateMap} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            </details>
            <details>
                <summary> State Assignment </summary>
                <StateAssignment binRep = {binRep} stateNodes = {props.stateNodes}  />
            </details>
            <details>
                <summary>Transition Table</summary>
                <StateTable nextStateMap = {nextStateMap} binRep = {binRep} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>
            </details>
            <details>
                <summary>Excitation Table</summary>
                <TransitionTable excitations = {excitations} stateNodes = {props.stateNodes} binRep = {binRep} latchLabel = 'SR' latchMap = {SRMap} numberOfInputVars = {props.numberOfInpVar}  />
            </details>
            <details>
                <summary> KMaps </summary>
            {
                kMaps.map((k, index)=>{
                    let r = simplifyFunction(truthTables[index]);
                    let s = '';
                    r.selectedPIs.forEach(e=> s+= getLiteral(e.comb, truthTables[index].vars) + ' + ' );
                    s = s.slice(0, s.length - 3);
                    if(s == '')
                        s = '0'
                    let key = 0;
                    return(
                        <div className={styles.functionBlockContainer}>
                            <details key={k.functionName}>
                                <summary>{ k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} </summary>
                                <div className = {styles.functionBlock}> 
                                    {/* <div> {k.functionName} </div> */}
                                    <KMap key = {key++} kMap = {k} />
                                    <div> {k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} = {s.split('').map(c => Number.isInteger(Number.parseInt(c)) ? <sub key={key++}>{c}</sub> : c  )} </div>
                                </div>
                            </details>
                        </div>
                    )
                })
            }
            </details>
            <div className={styles.backButtonContainer}>
                <button onClick = {()=> props.changeSynthesis(false)}> back to diagram </button>
            </div>
        </div>
    )
}

const StateTable : React.FC<{
    stateNodes : StateNode[],
    numberOfInpVar : number,
    nextStateMap : nextStateMap,
    binRep? : Map<string, string> 
}> = (props)=>{

    let inpComb = getInputCombination(props.numberOfInpVar);

    if(props.stateNodes.length == 0) 
        return(
            <div>
            </div>
        )
    
    return (
        <div className = {styles.stateTableContainer}>
            <table className = {styles.stateTable}>
                <thead >
                    <tr>
                        <th rowSpan={2}>previous state</th>
                        <th colSpan={Math.pow(2,props.numberOfInpVar)} > next state </th>
                    </tr>
                    <tr>
                        {
                            inpComb.map(inp=>{
                                return(
                                    <th key = {inp}> {inp} </th>
                                )
                            })
                        }
                    </tr>
                </thead>
                <tbody>
                {
                    props.stateNodes.map(s=>{
                        let t : React.ReactNode[] = [];
                        t = inpComb.map(comb=>{
                            let text = props.nextStateMap[s.label][comb].state;
                            if(props.binRep) text = props.binRep.get(text)!;
                            return (
                                <td key = {'s' + s.label + 'i' +  comb}>
                                    {text + '/' + props.nextStateMap[s.label][comb].output}
                                </td>
                            )
                        })
                        return(
                            <tr key={s.label}>
                                <td> {props.binRep ? props.binRep.get(s.label) :  s.label} </td>
                                {t}
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        </div>
    )
}

const StateAssignment : React.FC<{
    stateNodes : StateNode[],
    binRep : Map<string, string>
}> = (props)=>{
    
    
    return(
        <div className = {styles.stateAssignmentContainer}>
            <table className = {styles.stateAssignmentTable}>
                <thead>
                    <tr>
                        <th>State</th>
                        <th>Binary Representation</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.stateNodes.map(s=>{
                            return(
                                <tr key={s.label}>
                                    <td>{s.label}</td>
                                    <td>{props.binRep.get(s.label)}</td>
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
        </div>

    )
}

const TransitionTable : React.FC<{
    stateNodes : StateNode[],
    binRep : Map<string, string>,
    latchMap : {[key :string] : string},
    latchLabel : string,
    numberOfInputVars : number,
    excitations : excitationInterface[]
}> = (props)=>{


    let upperHeadRow : React.ReactNode[] = [];
    let lowerHeadRow : React.ReactNode[] = [];
    let stateBitCount = getRequiredBitForStates(props.stateNodes.length);
    let inpComb = getInputCombination(props.numberOfInputVars);
    
    for(let i = 0; i < stateBitCount; ++i){
        upperHeadRow.push(
            <th key = {i} colSpan = {Math.pow(2,props.numberOfInputVars)}>
                {props.latchLabel.length === 2 ? 
                (<span>{props.latchLabel[0]}<sub>{i}</sub>{props.latchLabel[1]}<sub>{i}</sub></span>  ) :
                (<span>{props.latchLabel}<sub>{i}</sub></span>)
                }
            </th>
        )
        inpComb.forEach(inp =>{
            lowerHeadRow.push(
                <th key = {inp + i}>
                    {inp}
                </th>
            )
        })
    }
    

    return(
        <div className = {styles.transitionTableContainer}>
            <table className = {styles.transitionTable}>
                <thead>
                    <tr>
                        <th rowSpan={2}> Previous State </th>
                        {upperHeadRow}
                    </tr>
                    <tr>
                        {lowerHeadRow}
                    </tr>
                </thead>
                <tbody>
                    {
                        props.stateNodes.map(stateNode =>{
                            let nextStateRows : React.ReactNode[] = [];
                            for(let i = 0; i < stateBitCount; ++i){
                                for(let j = 0; j < inpComb.length; ++j){
                                    nextStateRows.push(
                                        <td key = {'inp'+inpComb[j]+stateNode.label+'i'+i}>
                                            {props.excitations[i].map[props.binRep.get(stateNode.label)!][inpComb[j]]}
                                        </td>
                                    )
                                }
                            }
                            return(
                                <tr key = {stateNode.label}>
                                    <td>
                                        {props.binRep.get(stateNode.label)}
                                    </td>
                                    {nextStateRows}
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>

        </div>
    )
}

const KMap : React.FC<{
    kMap : kMap
}> = (props)=>{

    let rem = props.kMap.dims.rem;
    let row = props.kMap.dims.row;
    let col = props.kMap.dims.col;

    let remComb = generateGreyCode(rem);
    let rowComb = generateGreyCode(row);
    let colComb = generateGreyCode(col);
    

    // console.log(remComb, rowComb, colComb);

    console.log(props);
    
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

export default Design;