import React from 'react'

const Loading = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  )
}
const styles = {
    container:{
        height:"100vh",
        display:"flex",
    },
    spinner:{
        width:"50px",
        height:"50px"
    }
}
export default Loading
