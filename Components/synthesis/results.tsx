import React from "react";
import { Edge, StateNode } from "../state-diagram/state-diagram-interfaces";
import styles from '../../styles/design.module.scss'
import StateTable from "./StateTable";
import { generateKMap, getBinRepresentation, getLiteral, getNextStateMap, getRequiredBitForStates, getMaximals, simplifyFunction, stateMinimization, truthTablesFromExcitation, getExcitationsFromNextStateMap, getMinimumClosure, getReducedNextStateMap, getNewLabels } from "./helperFunctions";
import {  excitationInterface, implicationEntryMap, kMap, nextStateMap, truthTable } from "./interfaces";
import ExcitaitonTable from "./ExcitationTable";
import KMap from './kMap'
import ImplicationTable from "./ImplicationTable";
import StateAssignment from "./StateAssignment";
import MergerDiagram from "./MergerDiagram";
import { useState, useEffect } from "react";
import ClosureTable from "./ClosureTable";
import ReducedStates from "./ReducedStates";


const SRMap = {
    '00' : '0d',
    '01' : '10',
    '10' : '01',
    '11' : 'd0',
    '0d' : 'dd',
    '1d' : 'dd'
}
const JKMap = {
    '00' : '0d',
    '01' : '1d',
    '10' : 'd1',
    '11' : 'd0',
    '0d' : 'dd',
    '1d' : 'dd'
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

    const [nextStateMap , setNextStateMap] = useState<nextStateMap | null>(nextStateMap4);
    // let labels = ['A', 'B', 'C', 'D', 'E']
    let labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

    // let labels = props.stateNodes.map(s => s.label);
    useEffect(()=>{
        getNextStateMap(props.stateNodes, props.numberOfInpVar, props.numberOfOutputVars).then(s=>{
            // setNextStateMap(s);
        })
        
    }, [props])
    return (
        <div>
            {
                !nextStateMap && <div className = {styles.processingTextContainer}> calculating... </div>
            }
            {
                nextStateMap && <FromNextStateMap nextStateMap = {nextStateMap} labels = {labels} changeSynthesis={props.changeSynthesis} />
            }
        </div>
    )

   
}

export const FromNextStateMap : React.FC<{
    labels : string[],
    nextStateMap : nextStateMap,
    changeSynthesis : (b : boolean) => void,
    internalToOriginalMap? : {[internal : string] : string}
}> = (props)=>{
    const [reducedNextStateMap, setReducedNextStateMap] = useState<nextStateMap | null>(null);
    const [excitations, setExcitations] = useState<excitationInterface[] | null>(null);
    const [implicationEntries, setImplicationEntries] = useState<implicationEntryMap | null>(null);
    const [truthTables, setTruthTables] = useState<truthTable[] | null>(null);
    const [kMaps, setKMaps] = useState<kMap[]|null>(null);
    const [maximalCompatibles, setMaximalCompatibles] = useState<string[][] | null>(null);
    const [maximalIncompatibles, setMaximalIncompatibles] = useState<string[][] | null>(null);
    const [compatibles, setCompatibles] = useState<string[][] | null>();
    const [newLabels , setNewLabels ] = useState<string[]>(props.labels);
    const [binRep, setBinRep] = useState<Map<string, string>>(getBinRepresentation(props.labels));
    


    
    useEffect(()=>{
        
        let stateVars = getRequiredBitForStates(props.labels.length) ;
        let numberOfVars = stateVars + props.nextStateMap.numberOfInputVar;

        const getAllTruthTables = async (excitations : excitationInterface[]) : Promise<truthTable[]>=>{
            let t : truthTable[] = [];
            excitations.forEach(async e =>{
                let temp = await truthTablesFromExcitation(e,e.type === 'output' ? 'z' : 'JK');
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

        stateMinimization(props.labels, props.nextStateMap)
        .then(async s=>{
            setImplicationEntries(s);
            let mx = await getMaximals(props.labels,s);
            setMaximalCompatibles(mx);
            let mx2 = await getMaximals(props.labels, s, true);
            setMaximalIncompatibles(mx2);
            let upperBound = mx.length > props.labels.length ? props.labels.length : mx.length;
            let lowerBound = upperBound;
            mx2.forEach(m => lowerBound = lowerBound > m.length ? m.length : lowerBound);
            let comp = await getMinimumClosure(props.labels,mx, props.nextStateMap,upperBound, lowerBound);
            setCompatibles(comp);
            let newLabels = await getNewLabels(comp.length);
            setNewLabels(newLabels);
            let binRep = getBinRepresentation(newLabels);
            setBinRep(binRep);
            let newNxt = await getReducedNextStateMap(newLabels,comp, props.nextStateMap);
            setReducedNextStateMap(newNxt);
            let e = await getExcitationsFromNextStateMap(newLabels,newNxt,binRep,JKMap,2);
            e = [...e.filter(e=> e.type === 'state'), ... e.filter(e=> e.type === 'output')]
            setExcitations(e);
            let t = await getAllTruthTables(e);
            setTruthTables(t);
            let k = await getAllKmaps(t);
            setKMaps(k);
        })
        
    }, [props])                

    return (
        <div className={styles.synthesisContainer}>
            <Details summary = {'State Table'} 
            content = {props.nextStateMap && <StateTable   nextStateMap = {props.nextStateMap} stateLabels = {props.labels}/>} />
            <Details summary = {'Implication Table'} 
            content = {implicationEntries && <ImplicationTable labels = {props.labels} entries = {implicationEntries} />} />
            <Details summary = {'Merger Diagram For Compatibles'} 
            content = {implicationEntries && <MergerDiagram entries = {implicationEntries} stateLabels = {props.labels} />} />
            <Details summary = {'Merger Diagram For Incompatibles'} 
            content = {implicationEntries && <MergerDiagram inCompatibles={true} entries = {implicationEntries} stateLabels = {props.labels} />}/>
            <Details summary = {'Maximal Compatibles'} 
            content =  {maximalCompatibles && maximalCompatibles.map((arr, index) =>{
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
                        })}/>
            
            <Details summary = {'Maximal Incompatibles'} 
            content =  {maximalIncompatibles && maximalIncompatibles.map((arr, index) =>{
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
                        })}/>
            
            <Details summary = {'Closure Table'}
            content = {
                maximalCompatibles &&
                <ClosureTable nextStateMap = {props.nextStateMap} maximalCompatibles = {maximalCompatibles} />
            }
            />

            <Details summary = {'Reduced States'}
            content = {compatibles && <ReducedStates labels = {newLabels} compatibles = {compatibles} />}
            />

            <Details summary = {'Reduced State Table'} 
            content = {reducedNextStateMap && <StateTable   nextStateMap = {reducedNextStateMap} stateLabels = {newLabels}/>} />
            

            <Details summary = {'State Assignment '} 
            content = { <StateAssignment binRep = {binRep} stateLabels = {newLabels}  />}/>
            
            <Details summary = {'Transition Table '} 
            content = { reducedNextStateMap && <StateTable  nextStateMap = {reducedNextStateMap} binRep = {binRep} stateLabels = {newLabels}/>}/>
            
            <Details summary = {'Excitation Table'} 
            content = {excitations && <ExcitaitonTable  excitations = {excitations} stateLabels = {newLabels} binRep = {binRep} latchLabel = 'JK' latchMap = {JKMap} />}/>
            
            
            <Details summary = {'KMaps'} 
            content = {kMaps &&
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
                            <Details 
                            summary={k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)}
                            content = {
                                <div className = {styles.functionBlock}> 
                                    <KMap key = {key++} kMap = {k} />
                                    <div> {k.functionName.split('').map(c => Number.isInteger(parseInt(c)) ? (<sub key={key++}>{c}</sub>) : c)} = {s.split('').map(c => Number.isInteger(Number.parseInt(c)) ? <sub key={key++}>{c}</sub> : c  )} </div>
                                </div>
                            }
                            />
                        </div>
                    )
                })
            }/>
            
            <div className={styles.backButtonContainer}>
                <button onClick = {()=> props.changeSynthesis(false)}> back to diagram </button>
            </div>
        </div>
    )
}

const Details : React.FC<{
    summary : React.ReactNode,
    content : React.ReactNode
}> = (props)=>{
    return(
        <details>
            <summary> {props.summary} </summary>
            {props.content}
        </details>
    )
}

export default Design;

let nextStateMap2 : nextStateMap = {
    nextStateMap:{
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
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}

let nextStateMap3 : nextStateMap = {
    nextStateMap : {
        ['A'] : {
            '00' : {
                output : '0',
                state : 'D'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '0',
                state : 'F'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['B'] : {
            '00' : {
                output : '1',
                state : 'C'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'F'
            }
        },
        ['C'] : {
            '00' : {
                output : '1',
                state : 'C'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['D'] : {
            '00' : {
                output : '0',
                state : 'D'
            },
            '01' : {
                output : '0',
                state : 'B'
            },
            '11' : {
                output : '0',
                state : 'A'
            },
            '10' : {
                output : '0',
                state : 'F'
            }
        },
        ['E'] : {
            '00' : {
                output : '1',
                state : 'C'
            },
            '01' : {
                output : '0',
                state : 'F'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['F'] : {
            '00' : {
                output : '0',
                state : 'D'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '0',
                state : 'A'
            },
            '10' : {
                output : '0',
                state : 'F'
            }
        },
        ['G'] : {
            '00' : {
                output : '0',
                state : 'G'
            },
            '01' : {
                output : '0',
                state : 'G'
            },
            '11' : {
                output : '0',
                state : 'A'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        },
        ['H'] : {
            '00' : {
                output : '1',
                state : 'B'
            },
            '01' : {
                output : '0',
                state : 'D'
            },
            '11' : {
                output : '1',
                state : 'E'
            },
            '10' : {
                output : '0',
                state : 'A'
            }
        }
    },
    numberOfInputVar : 2,
    numberOfOutputVar : 1
    
}

let nextStateMap4 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : 'd',
                state : 'A'
            },
            '1' : {
                output : '1',
                state : 'C'
            }
        },
        ['B'] : {
            '0' : {
                output : 'd',
                state : 'B'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['C'] : {
            '0' : {
                output : 'd',
                state : 'G'
            },
            '1' : {
                output : '0',
                state : 'E'
            }
        },
        ['D'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : 'd',
                state : 'C'
            }
        },
        ['E'] : {
            '0' : {
                output : '1',
                state : 'A'
            },
            '1' : {
                output : 'd',
                state : 'C'
            }
        },
        ['F'] : {
            '0' : {
                output : 'd',
                state : 'D'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['G'] : {
            '0' : {
                output : 'd',
                state : 'G'
            },
            '1' : {
                output : 'd',
                state : 'G'
            }
        },
        ['H'] : {
            '0' : {
                output : 'd',
                state : 'H'
            },
            '1' : {
                output : 'd',
                state : 'D'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}

let nextStateMap5 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : 'd',
                state : 'D'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['B'] : {
            '0' : {
                output : '0',
                state : 'E'
            },
            '1' : {
                output : 'd',
                state : 'A'
            }
        },
        ['C'] : {
            '0' : {
                output : '0',
                state : 'D'
            },
            '1' : {
                output : 'd',
                state : 'B'
            }
        },
        ['D'] : {
            '0' : {
                output : 'd',
                state : 'C'
            },
            '1' : {
                output : 'd',
                state : 'C'
            }
        },
        ['E'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : 'd',
                state : 'B'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}

let nextStateMap6 : nextStateMap = {
    nextStateMap:{
        ['A'] : {
            '0' : {
                output : 'd',
                state : 'A'
            },
            '1' : {
                output : 'd',
                state : 'd'
            }
        },
        ['B'] : {
            '0' : {
                output : '1',
                state : 'C'
            },
            '1' : {
                output : '0',
                state : 'B'
            }
        },
        ['C'] : {
            '0' : {
                output : '0',
                state : 'D'
            },
            '1' : {
                output : '1',
                state : 'd'
            }
        },
        ['D'] : {
            '0' : {
                output : 'd',
                state : 'd'
            },
            '1' : {
                output : 'd',
                state : 'B'
            }
        },
        ['E'] : {
            '0' : {
                output : '0',
                state : 'A'
            },
            '1' : {
                output : '1',
                state : 'C'
            }
        }
    },
    numberOfInputVar : 1,
    numberOfOutputVar : 1
    
}
