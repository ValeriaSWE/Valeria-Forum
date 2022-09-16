export const Auth = async (data) => {
    localStorage.setItem('profile', JSON.stringify({ ... data }))
    console.log(data)
}