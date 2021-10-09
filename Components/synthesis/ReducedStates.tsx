import React from "react";
import styles from '../../styles/design.module.scss'


const ReducedStates : React.FC<{
    compatibles : string[][]
}> = (props)=>{
    return (
        <div className = {styles.reducedStateContainer}>
            {
                props.compatibles.map((compatible, index) =>{
                    if(compatible.length === 1){
                        return(
                            <div>
                                {'{ ' + compatible[0] + ' }' }
                            </div>
                        )
                    }
                    return(
                        <div key = {index}>
                            {
                                compatible.map((c, index)=>{
                                    if(index == 0) return '{ ' + c + ',';
                                    else if(index === compatible.length - 1)
                                        return ' ' + c + ' }'
                                    return ' ' + c + ',';
                                })
                            }
                        </div>
                    )
                    
                })
            }
        </div>
    )
}

export default ReducedStates;