import { useEffect, useRef } from 'react';
import css from './App.module.scss';
import { Main } from './graphics/Main';

function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            const scene = new Main(canvas);

            return () => {
                scene.dispose();
            };
        }
    }, []);

    return (
        <div className={css.wrapper}>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default App;
