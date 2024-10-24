import { useCallback, useEffect, useRef, useState } from 'react';
import css from './App.module.scss';
import { Main } from './graphics/Main';

function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const timeElRef = useRef<HTMLDivElement | null>(null);
    const scene = useRef<Main>();
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [heroHp, setHeroHp] = useState<number>(100); // State for Hero's HP

    const handleEscapeKeyPress = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && scene.current) {
            togglePause();
        }
    }, []);

    const togglePause = () => {
        if (scene.current) {
            scene.current.togglePause();
            setIsPaused((prev) => !prev);
        }
    };

    const handleRestartGame = () => {
        if (scene.current) {
            scene.current.restartGame();
            setHeroHp(100);
            togglePause();
        }
    };

    useEffect(() => {
        if (heroHp < 0) {
            togglePause();
        }
    }, [heroHp]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const timeEL = timeElRef.current;

        if (canvas && timeEL) {
            scene.current = new Main(canvas, timeEL, setHeroHp);

            window.addEventListener('keydown', handleEscapeKeyPress);

            return () => {
                scene.current?.dispose();
                window.removeEventListener('keydown', handleEscapeKeyPress);
            };
        }
    }, [handleEscapeKeyPress]);

    return (
        <div className={css.wrapper}>
            <div className={css.info}>
                {heroHp < 0 && (
                    <button className={css.pause} onClick={handleRestartGame}>
                        рестарт
                    </button>
                )}
                <div className={css.info__hp}>{heroHp > 0 ? `Здоровье: ${heroHp}` : 'Ты умер'}</div>
                <div className={css.info__time} ref={timeElRef}>
                    00:00
                </div>
                <button disabled={heroHp < 0} className={css.pause} onClick={togglePause}>
                    {isPaused ? 'Продолжить' : 'Остановить'}
                </button>
            </div>
            <canvas ref={canvasRef} />
        </div>
    );
}

export default App;
