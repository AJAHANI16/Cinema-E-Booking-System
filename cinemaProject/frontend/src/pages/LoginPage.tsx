const LoginPage = () => {
    return (
        <>
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <h1 className="text-2xl font-bold">Login</h1>
                    <div className="mt-4">
                        <form className="flex justify-center items-center flex-col bg-white p-6 rounded-lg shadow-md">
                            <div className="w-full">
                                <label htmlFor="email">Email:</label>
                                <input type="email" id="email" name="email" required className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"/>
                            </div>
                            <div className="w-full">
                                <label htmlFor="password">Password:</label>
                                <input type="password" id="password" name="password" required className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4"/>
                            </div>
                            <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Login</button>
                            <a href="/register" className="mt-2 text-blue-500 hover:underline">Don't have an account? Register</a>
                        </form>
                        
                    </div>
            </div>
        </>
    );
};

export default LoginPage;