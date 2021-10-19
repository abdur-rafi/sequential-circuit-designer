import React from 'react';
import styles from '../../styles/message.module.scss'
import { Message } from '../synthesis/interfaces';
import {ImCross} from 'react-icons/im';


class MessageBar extends React.Component<{
    message : Message,
    setMessage : (m : Message | null) => void
}, {
    timerId : NodeJS.Timeout | null
}>{
    
    constructor(props : any){
        super(props);
        this.state = {
            timerId : null
        }
    }


    componentDidMount(){
        let id = setTimeout(()=>{
            this.setState({timerId : null})
            this.props.setMessage(null);
        }, 5000)
        this.setState({timerId : id})
    }
    componentWillUnmount(){
        if(this.state.timerId){
            clearTimeout(this.state.timerId);
        }
    }

    render(){

        return(
            <div className = {styles.root}>
                {
                    
                    
                    <div className = {styles.messageContainer}>
                        <div className = {styles.message}>
                            {this.props.message.message}
                        </div>
                        <div className = {styles.crossIconContainer}>
                            <ImCross className = {styles.crossIcon} onClick = {()=>this.props.setMessage(null)} />
                        </div>
                    </div>
                
                }
            </div>
        )
    }
}

export default MessageBar;