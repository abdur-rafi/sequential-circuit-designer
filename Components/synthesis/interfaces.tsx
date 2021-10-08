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
    rowLabels : string,
    colLabels : string,
    entryLength : number
    
    
}
export interface nextStateMap {
    [state : string] : {
        [inpComb : string] : {
            state : string,
            output : string
        }
    }
}
export interface kMap{
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
export interface truthTable{
    table : {
        [inpComb : string] : string
    },
    dims : number,
    functionName : string,
    vars : string
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
