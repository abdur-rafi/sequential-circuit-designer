import React from "react";
import { Edge, StateNode } from "../state-diagram/state-diagram-interfaces";
import styles from '../../styles/design.module.scss'
import StateTable from "./StateTable";
import { generateKMap, getBinRepresentation, getExcitations, getLiteral, getNextStateMap, getRequiredBitForStates, getMaximals, simplifyFunction, stateMinimization, truthTablesFromExcitation } from "./helperFunctions";
import {  excitationInterface, implicationEntryMap, kMap, nextStateMap, truthTable } from "./interfaces";
import ExcitaitonTable from "./ExcitationTable";
import KMap from './kMap'
import ImplicationTable from "./ImplicationTable";
import StateAssignment from "./StateAssignment";
import MergerDiagram from "./MergerDiagram";
import { useState, useEffect } from "react";


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
    changeSynthesis : (b : boolean) => void,
    numberOfOutputVars : number
}> = (props)=>{



    const [excitations, setExcitations] = useState<excitationInterface[] | null>(null);
    const [nextStateMap , setNextStateMap] = useState<nextStateMap | null>(null);
    const [implicationEntries, setImplicationEntries] = useState<implicationEntryMap | null>(null);
    const [truthTables, setTruthTables] = useState<truthTable[] | null>(null);
    const [kMaps, setKMaps] = useState<kMap[]|null>(null);
    const [maximalCompatibles, setMaximalCompatibles] = useState<string[][] | null>(null);
    const [maximalIncompatibles, setMaximalIncompatibles] = useState<string[][] | null>(null);


    let stateVars = getRequiredBitForStates(props.stateNodes.length) ;
    let numberOfVars = stateVars + props.numberOfInpVar;
    const binRep = getBinRepresentation(props.stateNodes);
    const labels = props.stateNodes.map(s => s.label);

    const getAllTruthTables = async (excitations : excitationInterface[]) : Promise<truthTable[]>=>{
        let t : truthTable[] = [];
        excitations.forEach(async e =>{
            let temp = await truthTablesFromExcitation(e,numberOfVars,stateVars, e.type === 'output' ? 'z' : 'JK');
            t.push(...temp);
        })
        return t;
    }

    const getAllKmaps = async (truthTables : truthTable[]) : Promise<kMap[]> =>{
        let k : kMap[] = [];
        truthTables.forEach(async t=>{
            let temp = await generateKMap(t,numberOfVars);
            k.push(temp)
        });
        return k;
    }
    

    useEffect(()=>{
        getExcitations(props.stateNodes, binRep, props.numberOfInpVar,JKMap, 2, props.numberOfOutputVars).then(async e=>{
            console.log('here');
            e = [... e.filter(e => e.type === 'state'), ... e.filter(e => e.type === 'output')]
            console.log(e);
            setExcitations(e);
            let t = await getAllTruthTables(e);
            setTruthTables(t);
            let k = await getAllKmaps(t);
            setKMaps(k);
            
        })
        
    
        getNextStateMap(props.stateNodes, props.numberOfInpVar).then(async e=>{
            setNextStateMap(e);
            let s = await stateMinimization(labels, e, props.numberOfInpVar);
            setImplicationEntries(s);
            let mx = await getMaximals(labels,s);
            setMaximalCompatibles(mx);
            let mx2 = await getMaximals(labels, s, true);
            setMaximalIncompatibles(mx2);
            console.log(mx);
        })
        
    }, [props])

    return (
        <div className={styles.synthesisContainer}>
            <details>
                <summary>State Table</summary>
                {nextStateMap && <StateTable showOutput={true}  nextStateMap = {nextStateMap} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>}
            </details>
             <details>
                <summary> Implication Table </summary>
                {implicationEntries && <ImplicationTable labels = {labels} entries = {implicationEntries} />}
            </details>
            
            <details>
                <summary> Merger Diagram For Compatibles </summary>
                { implicationEntries && <MergerDiagram entries = {implicationEntries} stateLabels = {labels} />}
            </details>
            <details>
                <summary> Merger Diagram For Incompatibles </summary>
               { implicationEntries && <MergerDiagram inCompatibles={true} entries = {implicationEntries} stateLabels = {labels} />}
            </details>
            
            <details>
                <summary>Maximal Compatibles</summary>
                
                {maximalCompatibles && maximalCompatibles.map((arr, index) =>{
                    return(
                        <div key={index}>
                            {
                                arr.map((s, i)=>{
                                    if(arr.length === 1){
                                        return '{ ' + s + ' }'
                                    }
                                    if(i === 0){
                                        return '{ ' + s + ', ';
                                    }
                                    else if(i === arr.length - 1){
                                        return s + ' }';
                                    }
                                    return s + ', '
                                })
                            }
                        </div>
                    )
                })}
            </details>

            <details>
                <summary>Maximal Incompatibles</summary>
                
                {maximalIncompatibles && maximalIncompatibles.map((arr, index) =>{
                    return(
                        <div key={index}>
                            {
                                arr.map((s, i)=>{
                                    if(arr.length === 1){
                                        return '{ ' + s + ' }'
                                    }
                                    if(i === 0){
                                        return '{ ' + s + ', ';
                                    }
                                    else if(i === arr.length - 1){
                                        return s + ' }';
                                    }
                                    return s + ', '
                                })
                            }
                        </div>
                    )
                })}
            </details>

            <details>
                <summary> State Assignment </summary>
                <StateAssignment binRep = {binRep} stateNodes = {props.stateNodes}  />
            </details>
            <details>
                <summary>Transition Table</summary>
                { nextStateMap && <StateTable  nextStateMap = {nextStateMap} binRep = {binRep} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>}
            </details>
            <details>
                <summary>Excitation Table</summary>
                {excitations && <ExcitaitonTable  excitations = {excitations} stateNodes = {props.stateNodes} binRep = {binRep} latchLabel = 'SR' latchMap = {SRMap} numberOfInputVars = {props.numberOfInpVar}  />}
            </details>
            
            <details>
                <summary> KMaps </summary>
            {kMaps &&
                kMaps.map((k, index)=>{
                    let r = simplifyFunction(truthTables![index]);
                    let s = '';
                    r.selectedPIs.forEach(e=> s+= getLiteral(e.comb, truthTables![index].vars) + ' + ' );
                    s = s.slice(0, s.length - 3);
                    if(s == '')
                        s = '0'
                    let key = 0;
                    return(
                        <div key = {k.functionName} className={styles.functionBlockContainer}>
                            <details>
                                <summary>{ k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} </summary>
                                <div className = {styles.functionBlock}> 
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



let nextStateMap2 : nextStateMap = {
    ['A'] : {
        '0' : {
            output : '0',
            state : 'E'
        },
        '1' : {
            output : '0',
            state : 'D'
        }
    },
    ['B'] : {
        '0' : {
            output : '1',
            state : 'A'
        },
        '1' : {
            output : '0',
            state : 'F'
        }
    },
    ['C'] : {
        '0' : {
            output : '0',
            state : 'C'
        },
        '1' : {
            output : '1',
            state : 'A'
        }
    },
    ['D'] : {
        '0' : {
            output : '0',
            state : 'B'
        },
        '1' : {
            output : '0',
            state : 'A'
        }
    },
    ['E'] : {
        '0' : {
            output : '1',
            state : 'D'
        },
        '1' : {
            output : '0',
            state : 'C'
        }
    },
    ['F'] : {
        '0' : {
            output : '0',
            state : 'C'
        },
        '1' : {
            output : '1',
            state : 'D'
        }
    },
    ['G'] : {
        '0' : {
            output : '1',
            state : 'H'
        },
        '1' : {
            output : '1',
            state : 'G'
        }
    },
    ['H'] : {
        '0' : {
            output : '1',
            state : 'C'
        },
        '1' : {
            output : '1',
            state : 'B'
        }
    },
    
}

const TestDesign : React.FC<{
    stateNodes : StateNode[],
    edges : Edge[],
    numberOfInpVar : number,
    changeSynthesis : (b : boolean) => void,
    numberOfOutputVars : number
}> = (props)=>{



    // const [excitations, setExcitations] = useState<excitationInterface[] | null>(null);
    const [nextStateMap , setNextStateMap] = useState<nextStateMap >(nextStateMap2);
    const [implicationEntries, setImplicationEntries] = useState<implicationEntryMap | null>(null);
    // const [truthTables, setTruthTables] = useState<truthTable[] | null>(null);
    // const [kMaps, setKMaps] = useState<kMap[]|null>(null);
    const [maximalCompatibles, setMaximalCompatibles] = useState<string[][] | null>(null);
    const [maximalIncompatibles, setMaximalIncompatibles] = useState<string[][] | null>(null);


    let stateVars = getRequiredBitForStates(props.stateNodes.length) ;
    let numberOfVars = stateVars + props.numberOfInpVar;
    const binRep = getBinRepresentation(props.stateNodes);
    // const labels = props.stateNodes.map(s => s.label);

    
    let labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    const getAllTruthTables = async (excitations : excitationInterface[]) : Promise<truthTable[]>=>{
        let t : truthTable[] = [];
        excitations.forEach(async e =>{
            let temp = await truthTablesFromExcitation(e,numberOfVars,stateVars, e.type === 'output' ? 'z' : 'JK');
            t.push(...temp);
        })
        return t;
    }

    const getAllKmaps = async (truthTables : truthTable[]) : Promise<kMap[]> =>{
        let k : kMap[] = [];
        truthTables.forEach(async t=>{
            let temp = await generateKMap(t,numberOfVars);
            k.push(temp)
        });
        return k;
    }
    

    useEffect(()=>{
        getNextStateMap(props.stateNodes, props.numberOfInpVar).then(async e=>{
            // setNextStateMap(e);
            let s = await stateMinimization(labels, nextStateMap, props.numberOfInpVar);
            setImplicationEntries(s);
            let mx = await getMaximals(labels,s);
            setMaximalCompatibles(mx);
            let mx2 = await getMaximals(labels, s, true);
            setMaximalIncompatibles(mx2);
            console.log(mx);
        })
        
    }, [props])
    


    return (
        <div className={styles.synthesisContainer}>
            {/* <details>
                <summary>State Table</summary>
                {nextStateMap && <StateTable showOutput={true}  nextStateMap = {nextStateMap} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>}
            </details> */}
             <details>
                <summary> Implication Table </summary>
                {implicationEntries && <ImplicationTable labels = {labels} entries = {implicationEntries} />}
            </details>
            
            <details>
                <summary> Merger Diagram For Compatibles </summary>
                { implicationEntries && <MergerDiagram entries = {implicationEntries} stateLabels = {labels} />}
            </details>
            <details>
                <summary> Merger Diagram For Incompatibles </summary>
               { implicationEntries && <MergerDiagram inCompatibles={true} entries = {implicationEntries} stateLabels = {labels} />}
            </details>
            
            <details>
                <summary>Maximal Compatibles</summary>
                
                {maximalCompatibles && maximalCompatibles.map((arr, index) =>{
                    return(
                        <div key={index}>
                            {
                                arr.map((s, i)=>{
                                    if(arr.length === 1){
                                        return '{ ' + s + ' }'
                                    }
                                    if(i === 0){
                                        return '{ ' + s + ', ';
                                    }
                                    else if(i === arr.length - 1){
                                        return s + ' }';
                                    }
                                    return s + ', '
                                })
                            }
                        </div>
                    )
                })}
            </details>

            <details>
                <summary>Maximal Incompatibles</summary>
                
                {maximalIncompatibles && maximalIncompatibles.map((arr, index) =>{
                    return(
                        <div key={index}>
                            {
                                arr.map((s, i)=>{
                                    if(arr.length === 1){
                                        return '{ ' + s + ' }'
                                    }
                                    if(i === 0){
                                        return '{ ' + s + ', ';
                                    }
                                    else if(i === arr.length - 1){
                                        return s + ' }';
                                    }
                                    return s + ', '
                                })
                            }
                        </div>
                    )
                })}
            </details>

            <details>
                <summary> State Assignment </summary>
                <StateAssignment binRep = {binRep} stateNodes = {props.stateNodes}  />
            </details>
            {/* <details>
                <summary>Transition Table</summary>
                { nextStateMap && <StateTable  nextStateMap = {nextStateMap} binRep = {binRep} numberOfInpVar = {props.numberOfInpVar} stateNodes = {props.stateNodes}/>}
            </details> */}
            <div className={styles.backButtonContainer}>
                <button onClick = {()=> props.changeSynthesis(false)}> back to diagram </button>
            </div>
        </div>
    )
}



export default Design;
