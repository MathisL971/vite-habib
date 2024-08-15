import axios, { AxiosError } from "axios";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import Cookies from 'js-cookie';

function App() {
  const accessToken = Cookies.get('token');
  return accessToken ? <Home /> : <Auth />;
}

function Home() {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="flex h-screen justify-center items-center">
      <div className="flex flex-col gap-5">
        <h1 className="text-3xl font-bold">Vous êtes déjà connecté</h1>
        <button 
          className={`${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-500'
          } text-white font-bold py-2 px-4 rounded shadow-lg flex justify-center items-center`}
          disabled={loading}
          onClick={() => {
            setLoading(true);
            setTimeout(() => {
              Cookies.remove('token');
              window.location.reload();
            }, 1000);
          }}
        >
          {loading ? <ClipLoader color="white" size={24} /> : 'Se déconnecter'}
        </button>
      </div>
    </div>
  )
}

function Auth() {
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-700 justify-center items-center">
      <form className="flex flex-col gap-4 bg-gray-600 p-14 rounded-md" onSubmit={(e) => {          
        e.preventDefault();
        setLoading(true);

        setTimeout(async () => {
          try {
            await axios.post('http://localhost:3000', {
              email,
              password
            }, {
              withCredentials: true
            });
            window.location.reload();
          } catch (error: unknown) {
            setLoading(false);
            console.error(error);
            if (axios.isAxiosError(error)) {
              const e = error as AxiosError;
              if (e.response?.status === 401) {
                setError('Email ou mot de passe incorrect');
              } else {
                setError('Une erreur est survenue');
              }
            } else {
              setError('Une erreur est survenue');
            }
            setTimeout(() => setError(''), 5000);
          }
        }, 1000);
      }}>
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-bold text-white">Connectez-vous</h1>
          <p className="text-gray-300">
            Pour accéder à cette page, vous devez vous connecter.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded-md"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="p-2 rounded-md"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <div className="bg-red-500 text-white p-2 rounded-md text-center">{error}</div>}
          <button 
            type="submit" 
            disabled={!email || !password || loading} 
            className={`${
              !email || !password || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-500'
            } text-white p-2 rounded-md font-semibold w-full flex justify-center items-center`}
          >
            {
              loading
                ? <ClipLoader color="white" size={24} />
                : 'Se connecter'
            }
          </button>
        </div>
      </form>
    </div>
  )
}

export default App
