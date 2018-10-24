export default (time=new Date())=>{
    const FormatTime=new Date(time)
    const Year=FormatTime.getFullYear()
    const Month=FormatTime.getMonth()+1
    const Day=FormatTime.getDate()
    const Hours=FormatTime.getHours()
    const Minutes=FormatTime.getMinutes()
    const seconds=FormatTime.getSeconds()
    return `${Year}-${Month}-${Day}   ${Hours}:${Minutes}:${seconds}`
}   