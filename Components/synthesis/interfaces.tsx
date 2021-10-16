export interface excitationInterface{
    map : {
        [state : string] : {
            [inpComb : string] : string
        }
    },
    dims : {
        row : number,
        col : number
    },
    type : 'state' | 'output',
    index : number,
    rowLabels : string[],
    colLabels : string[],
    entryLength : number,
    
    
}
export interface nextStateMap {
    nextStateMap:{
            [state : string] : {
            [inpComb : string] : {
                state : string,
                output : string
            }
        }
    },
    numberOfInputVar : number,
    numberOfOutputVar : number
}
export interface kMap{
    map :{
        [pulse : string] :{
            [remComb : string] : {
                [rowComb : string] : {
                    [columnComb : string] : string
                }
            }
        }    
    },
    dims : {
        pulse : number,
        rem : number
        row : number,
        col : number
    },
    functionName : string,
    vars : {
        pulse : string[],
        rem : string[],
        row : string[],
        col : string[]
    },
    pulseMode : boolean
}
export interface truthTable{
    table : {
        [inpComb : string] : string
    },
    dims : number,
    functionName : string,
    vars : string[]
}

export interface tabulationGroupItem{
    comb : string,
    taken : boolean,
    minterms : Set<string>
}
export interface implicationEntryMap{
    
    [row : string] : {
        [col : string] : {
            dependencies : string[],
            isCompatible : boolean
        }
    }

}
export interface stringToStringMap{
    [key : string] : string
}

export interface simplifyFunctionReutnType{

    [pulse : string] : {
    
        EPIs: tabulationGroupItem[];
        PIs: tabulationGroupItem[];
        selectedPIs: tabulationGroupItem[];
        groupsPerStep? : tabulationGroupItem[][][]
    }
}

export type circuitMode = 'pulse' | 'synch'

export interface lastSelected{
    i : number,
    j : number,
    type : 'state' | 'entry' | 'output'
}

export interface Error{
    i : number,
    j : number,
    type : 'state' | 'output' | 'entry', 
    message? : string
}

export type LatchType = 'JK' | 'SR' | 'D' | 'T'