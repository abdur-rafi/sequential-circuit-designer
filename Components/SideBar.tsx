import React from 'react'
import styles from '../styles/design.module.scss'
import {ImCancelCircle} from 'react-icons/im'

class SideBar extends React.Component<{
    toggleSideBar : ()=>void
}, {}>{

    render() : React.ReactNode{
        return(
            <div className = {styles.sideBar}>
                <div className = {styles.crossIconContainer}>
                    <div>
                        <ImCancelCircle className={styles.crossIcon} onClick={this.props.toggleSideBar} />
                    </div>
                </div>
                {/* asdfh asdf
                <button onClick={this.props.toggleSideBar}> Close</button> */}
            </div>
        )
    }
}

export default SideBar;