import { useEffect, useRef } from 'react';
import css from './App.module.scss';
import { Main } from './graphics/Main';

function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const timeElRef = useRef<HTMLDivElement | null>(null);
    const scene = useRef<Main>();

    useEffect(() => {
        const canvas = canvasRef.current;
        const timeEL = timeElRef.current;

        if (canvas && timeEL) {
            scene.current = new Main(canvas, timeEL);

            return () => {
                scene.current!.dispose();
            };
        }
    }, []);

    return (
        <div className={css.wrapper}>
            <div className={css.info}>
                <div className={css.info__time} ref={timeElRef}>
                    asd
                </div>
                <button className={css.pause} onClick={() => scene.current?.togglePause()}>
                    Toggle pause
                </button>
            </div>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default App;
