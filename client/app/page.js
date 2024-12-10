'use client'
import styles from './page.module.css';
import { useState, useEffect, use } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { checkPin } from './handler';
import WeatherChart from './graph';
import io from 'socket.io-client';
import Image from 'next/image';

export default function Home() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [socket, setSocket] = useState(null);

  const [vhodStatus, setVhodStatus] = useState('OFF');
  const [vhodCurrTemp, setVhodCurrTemp] = useState('N/A');
  const [vhodHum, setVhodHum] = useState('N/A');
  const [vhodMotion, setVhodMotion] = useState('NO');
  const [vhodLastMotion, setVhodLastMotion] = useState(['N/A', '']);
  const [vhodCurrRain, setVhodCurrRain] = useState('NO');
  const [vhodLastRain, setVhodLastRain] = useState(['N/A', '']);
  const [vhodTempGraph, setVhodTempGraph] = useState([]);
  const [vhodRainGraph, setVhodRainGraph] = useState([]);

  const [navesStatus, setNavesStatus] = useState('OFF');
  const [navesCurrTemp, setNavesCurrTemp] = useState('N/A');
  const [navesHum, setNavesHum] = useState('N/A');
  const [navesMotion, setNavesMotion] = useState('NO');
  const [navesLastMotion, setNavesLastMotion] = useState(['N/A', '']);
  const [navesCurrRain, setNavesCurrRain] = useState('NO');
  const [navesLastRain, setNavesLastRain] = useState(['N/A', '']);
  const [navesGas, setNavesGas] = useState('NO');
  const [navesTempGraph, setNavesTempGraph] = useState([]);
  const [navesRainGraph, setNavesRainGraph] = useState([]);

  const [forecastData, setForecastData] = useState([]);

  const [vhodDisplayMotion, setVhodDisplayMotion] = useState([]);
  const [showingPastMotionVhod, setShowingPastMotionVhod] = useState(false);
  const [vhodDisplayRain, setVhodDisplayRain] = useState([]);
  const [showingPastRainVhod, setShowingPastRainVhod] = useState(false);
  const [vhodDisplayHum , setVhodDisplayHum] = useState([]);
  const [showingPastHumVhod, setShowingPastHumVhod] = useState(false);
  const [vhodDisplayTemp , setVhodDisplayTemp] = useState([]);
  const [showingPastTempVhod, setShowingPastTempVhod] = useState(false);

  const [navesDisplayMotion, setNavesDisplayMotion] = useState([]);
  const [showingPastMotionNaves, setShowingPastMotionNaves] = useState(false);
  const [navesDisplayRain, setNavesDisplayRain] = useState([]);
  const [showingPastRainNaves, setShowingPastRainNaves] = useState(false);
  const [navesDisplayHum , setNavesDisplayHum] = useState([]);
  const [showingPastHumNaves, setShowingPastHumNaves] = useState(false);
  const [navesDisplayTemp , setNavesDisplayTemp] = useState([]);
  const [showingPastTempNaves, setShowingPastTempNaves] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('message', (sensor_data) => {
        const parsed_data = JSON.parse(sensor_data);

        if(parsed_data.forecast.length > 0) { 
          setForecastData(parsed_data.forecast) 
        }

        const vhod = parsed_data.vhod;
        setVhodStatus(vhod.status);
        setVhodCurrTemp(parseFloat(vhod.curr_temp).toFixed(1));
        setVhodDisplayTemp(prev => {
          let tm = new Date();
          let newEntry = `${tm.getHours()}:${tm.getMinutes()}:${tm.getSeconds()} --> ${parseFloat(vhod.curr_temp).toFixed(1)}℃`; 
          if (!prev.includes(newEntry)) {
            return [...prev, newEntry];
          }
          return prev;
        });
        setVhodHum(Math.round(parseFloat(vhod.humidity)));
        setVhodDisplayHum(prev => {
          let tm = new Date();
          let newEntry = `${tm.getHours()}:${tm.getMinutes()}:${tm.getSeconds()} --> ${Math.round(parseFloat(vhod.humidity))}%`; 
          if (!prev.includes(newEntry)) {
            return [...prev, newEntry];
          }
          return prev;
        });
        setVhodMotion(vhod.motion);
        if (vhod.last_motion !== 0) {
          let lastMotionDate = new Date(vhod.last_motion);
          let m_year = lastMotionDate.getFullYear().toString().slice(2); 
          let m_month = (lastMotionDate.getMonth() + 1).toString().padStart(2, '0'); 
          let m_day = lastMotionDate.getDate().toString().padStart(2, '0');
          let m_hours = lastMotionDate.getHours().toString().padStart(2, '0');
          let m_minutes = lastMotionDate.getMinutes().toString().padStart(2, '0');
          setVhodLastMotion([`${m_hours}:${m_minutes}`,`${m_day}/${m_month}/${m_year}`]);
          setVhodDisplayMotion(prev => {
            let newEntry = `@ ${m_hours}:${m_minutes} on ${m_day}/${m_month}/${m_year}`;
            if (!prev.includes(newEntry)) {
              return [...prev, newEntry];
            }
            return prev;
          });
        } else {
          setVhodLastMotion(['N/A','']);
        }
        setVhodCurrRain(vhod.curr_rain);
        if (vhod.last_rain !== 0) {
          let lastRainDate = new Date(vhod.last_rain);
          let r_year = lastRainDate.getFullYear().toString().slice(2); 
          let r_month = (lastRainDate.getMonth() + 1).toString().padStart(2, '0'); 
          let r_day = lastRainDate.getDate().toString().padStart(2, '0');
          let r_hours = lastRainDate.getHours().toString().padStart(2, '0');
          let r_minutes = lastRainDate.getMinutes().toString().padStart(2, '0');
          setVhodLastRain([`${r_hours}:${r_minutes}`,`${r_day}/${r_month}/${r_year}`]);
          setVhodDisplayRain(prev => {
            let newEntry = `@ ${r_hours}:${r_minutes} on ${r_day}/${r_month}/${r_year}`;
            if (!prev.includes(newEntry)) {
              return [...prev, newEntry];
            }
            return prev;
          });
        } else {
          setVhodLastRain(['N/A','']);
        }

        const naves = parsed_data.naves;
        setNavesStatus(naves.status);
        setNavesCurrTemp(parseFloat(naves.curr_temp).toFixed(1));
        setNavesDisplayTemp(prev => {
          let tm = new Date();
          let newEntry = `${tm.getHours()}:${tm.getMinutes()}:${tm.getSeconds()} --> ${parseFloat(naves.curr_temp).toFixed(1)}℃`; 
          if (!prev.includes(newEntry)) {
            return [...prev, newEntry];
          }
          return prev;
        });
        setNavesHum(Math.round(parseFloat(naves.humidity)));
        setNavesDisplayHum(prev => {
          let tm = new Date();
          let newEntry = `${tm.getHours()}:${tm.getMinutes()}:${tm.getSeconds()} --> ${Math.round(parseFloat(naves.humidity))}%`; 
          if (!prev.includes(newEntry)) {
            return [...prev, newEntry];
          }
          return prev;
        });
        setNavesMotion(naves.motion);
        if (naves.last_motion !== 0) {
          let lastMotionDate = new Date(naves.last_motion);
          let m_year = lastMotionDate.getFullYear().toString().slice(2); 
          let m_month = (lastMotionDate.getMonth() + 1).toString().padStart(2, '0'); 
          let m_day = lastMotionDate.getDate().toString().padStart(2, '0');
          let m_hours = lastMotionDate.getHours().toString().padStart(2, '0');
          let m_minutes = lastMotionDate.getMinutes().toString().padStart(2, '0');
          setNavesLastMotion([`${m_hours}:${m_minutes}`,`${m_day}/${m_month}/${m_year}`]);
          setNavesDisplayMotion(prev => {
            let newEntry = `@ ${m_hours}:${m_minutes} on ${m_day}/${m_month}/${m_year}`;
            if (!prev.includes(newEntry)) {
              return [...prev, newEntry];
            }
            return prev;
          });
        } else {
          setNavesLastMotion(['N/A','']);
        }
        setNavesCurrRain(naves.curr_rain);
        if (naves.last_rain !== 0) {
          let lastRainDate = new Date(naves.last_rain);
          let r_year = lastRainDate.getFullYear().toString().slice(2); 
          let r_month = (lastRainDate.getMonth() + 1).toString().padStart(2, '0'); 
          let r_day = lastRainDate.getDate().toString().padStart(2, '0');
          let r_hours = lastRainDate.getHours().toString().padStart(2, '0');
          let r_minutes = lastRainDate.getMinutes().toString().padStart(2, '0');
          setNavesLastRain([`${r_hours}:${r_minutes}`,`${r_day}/${r_month}/${r_year}`]);
          setNavesDisplayRain(prev => {
            let newEntry = `@ ${r_hours}:${r_minutes} on ${r_day}/${r_month}/${r_year}`;
            if (!prev.includes(newEntry)) {
              return [...prev, newEntry];
            }
            return prev;
          });
        } else {
          setNavesLastRain(['N/A','']);
        }
        if (naves.low_gas === 'OFF' && naves.high_gas === 'OFF') {
          setNavesGas('N/A');
        } else if (naves.low_gas === 'NO' && naves.high_gas === 'NO') {
          setNavesGas('NO');
        } else {
          if (naves.high_gas === 'YES') {
            setNavesGas('HIGH');
          } else if (naves.low_gas === 'YES') {
            setNavesGas('LOW');
          } else {
            setNavesGas('N/A');
          }
        }

        if (parsed_data.lh === 'Y') {
          setVhodTempGraph(vhod.temps.map(parseFloat));
          setVhodRainGraph(vhod.rain.map(parseFloat));
          setNavesTempGraph(naves.temps.map(parseFloat));
          setNavesRainGraph(naves.rain.map(parseFloat));
        }
      });
    }
  });

  useEffect(() => {
    if (vhodStatus === 'OFF') {
      setVhodMotion('NO');
      setVhodCurrRain('NO');
      setVhodCurrTemp('N/A');
      setVhodHum('N/A');
    } else if (navesStatus === 'OFF') {
      setNavesMotion('NO');
      setNavesCurrRain('NO');
      setNavesCurrTemp('N/A');
      setNavesHum('N/A');
    } 
  }, [vhodStatus, navesStatus])

  const handlePIN = () => {
    if (checkPin(pin)) {
      setUnlocked(true);
    } else {
      alert('Incorrect PIN');
    }
  };

  const endSession = () => {
    setUnlocked(false);
  }

  return (
    !unlocked ? <section className={styles.main}>
      <div className={styles.homeFrame}>
        <div className={styles.homeForm}>
          <h1 className={styles.homeTitle}>KK-SYS</h1>
          <div className={styles.homeFlexRow}>
            <span className={styles.homeSpan}>Enter PIN to continue</span>
            <TextField id='login' label='PIN' variant='outlined' size='small' sx={{mt: '20px'}} value={pin} onChange={(e) => setPin(e.target.value)}/>
          </div>
          <Button variant="contained" sx={{'background': '#1b263b', mb: '10px'}} onClick={handlePIN}>Enter</Button>
        </div>
      </div>
    </section> : <section className={styles.pageParent}>

      <section className={styles.panelTitle}>
        <span>System status: {vhodStatus === 'ON' && navesStatus === 'ON' ? 'GOOD' : (vhodStatus === 'OFF' && navesStatus === 'OFF' ? 'SYSTEMS OFFLINE' : 'PARTIAL FUNCTIONALITY')}</span>
        <Button variant='contained' onClick={endSession}>Log out</Button>
      </section>

      <section className={styles.panelForecast}>
        {forecastData.length === 0 ? <div className={styles.forecastOffline}>There is no forecast data at the moment.</div> : forecastData.map((v, i) => (
          <div className={styles.forecastBlock} key={i}>
            <div>
              <span className={styles.forecastMin}>{v[1]}</span>
              <span className={styles.forecastSlash}>{'/'}</span>
              <span className={styles.forecastMax}>{v[2]}</span>
            </div>
            <div><span className={styles.forecastTitle}>{v[3]}</span></div>
            <Image src={'/' + v[4] + '.png'} alt='weather icon' height={80} width={80} />
            <div><span className={styles.forecastDate}>{v[0]}</span></div>
          </div>
        ))}
      </section>

      <section className={styles.panelFrame}>
        <div className={styles.panelFrameCol}>
          <div>
            <span className={styles.popupTitle}>mcu/vhod</span>
          </div>
          <div className={vhodStatus === 'OFF' ? styles.redHighlight : styles.panelSubframe}>
            <span className={styles.panelReadings}>{vhodStatus}</span>
            <span className={styles.panelSubreading}>Status</span>
          </div>
          <div className={styles.panelSubframe} onClick={() => setShowingPastTempVhod((v) => !v)}>
            <span className={styles.panelReadings}>{vhodCurrTemp} &#8451;</span>
            <span className={styles.panelSubreading}>Temperature</span>
          </div>
          <div className={styles.panelSubframe} onClick={() => setShowingPastHumVhod((v) => !v)}>
            <span className={styles.panelReadings}>{vhodHum} %</span>
            <span className={styles.panelSubreading}>Humidity</span>
          </div>
        </div>

        {showingPastMotionVhod ? <section className={styles.panelAddData}>
          <div>
            <span>Recorded motion activity:</span>
            <Button variant="contained" size='small' onClick={() => setVhodDisplayMotion([])}>Reset</Button>
          </div>
          <ul>
          {vhodDisplayMotion.length === 0 ? ('No data') : ''}
          {vhodDisplayMotion.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
          </ul>
        </section> : (showingPastRainVhod ? <section className={styles.panelAddData}>
          <div>
            <span>Recorded rain activity:</span>
            <Button variant="contained" size='small' onClick={() => setVhodDisplayRain([])}>Reset</Button>
          </div>
          <ul>
          {vhodDisplayRain.length === 0 ? ('No data') : ''}
          {vhodDisplayRain.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
          </ul>
        </section> : (showingPastHumVhod ? <section className={styles.panelAddData}>
          <div>
            <span>Recorded humidity %:</span>
            <Button variant="contained" size='small' onClick={() => setVhodDisplayHum([])}>Reset</Button>
          </div>
          <ul>
          {vhodDisplayHum.length === 0 ? ('No data') : ''}
          {vhodDisplayHum.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
          </ul>
        </section> : (showingPastTempVhod ? <section className={styles.panelAddData}>
          <div>
            <span>Recorded temperature:</span>
            <Button variant="contained" size='small' onClick={() => setVhodDisplayTemp([])}>Reset</Button>
          </div>
          <ul>
          {vhodDisplayTemp.length === 0 ? ('No data') : ''}
          {vhodDisplayTemp.map((v, i) => (
            <li key={i}>{v}</li>
          ))}
          </ul>
        </section> :
        <div className={styles.graph}><WeatherChart rain_data={vhodRainGraph} temp_data={vhodTempGraph} index={1}/></div> )))}

        <div className={styles.panelFrameCol}>
          <div className={vhodMotion === 'YES' ? styles.redHighlight : styles.panelSubframe} onClick={() => setShowingPastMotionVhod((v) => !v)}>
            <span className={styles.panelReadings}>{vhodMotion}</span>
            <span className={styles.panelSubreading}>Motion</span>
          </div>
          <div className={styles.panelSubframe}>
            <span className={styles.panelReadings}>{vhodLastMotion[0]}</span>
            <span className={styles.panelSubreading}>{vhodLastMotion[1]}</span>
            <span className={styles.panelSubreading}>Last motion</span>
          </div>
          <div className={vhodCurrRain === 'YES' ? styles.blueHighlight : styles.panelSubframe} onClick={() => setShowingPastRainVhod((v) => !v)}>
            <span className={styles.panelReadings}>{vhodCurrRain}</span>
            <span className={styles.panelSubreading}>Rain</span>
          </div>
          <div className={styles.panelSubframe}>
            <span className={styles.panelReadings}>{vhodLastRain[0]}</span>
            <span className={styles.panelSubreading}>{vhodLastRain[1]}</span>
            <span className={styles.panelSubreading}>Last rain</span>
          </div>
        </div>
      </section>

      <section className={styles.panelFrame}>
        <div className={styles.panelFrameCol}>
          <div>
            <span className={styles.popupTitle}>mcu-ard/naves</span>
          </div>
          <div className={navesStatus === 'OFF' ? styles.redHighlight : styles.panelSubframe}>
            <span className={styles.panelReadings}>{navesStatus}</span>
            <span className={styles.panelSubreading}>Status</span>
          </div>
          <div className={styles.panelSubframe} onClick={() => setShowingPastTempNaves((v) => !v)}>
            <span className={styles.panelReadings}>{navesCurrTemp} &#8451;</span>
            <span className={styles.panelSubreading}>Temperature</span>
          </div>
          <div className={styles.panelSubframe} onClick={() => setShowingPastHumNaves((v) => !v)}>
            <span className={styles.panelReadings}>{navesHum} %</span>
            <span className={styles.panelSubreading}>Humidity</span>
          </div>
          <div className={navesGas === 'LOW' ? styles.yellowHighlight : (navesGas === 'HIGH' ? styles.redHighlight : styles.panelSubframe)}>
            <span className={styles.panelReadings}>{navesGas}</span>
            <span className={styles.panelSubreading}>Gas/CO2</span>
          </div>
        </div>

        {showingPastTempNaves ? (
          <section className={styles.panelAddData}>
            <div>
              <span>Recorded temperature:</span>
              <Button variant="contained" size='small' onClick={() => setNavesDisplayTemp([])}>Reset</Button>
            </div>
            <ul>
              {navesDisplayTemp.length === 0 ? ('No data') : ''}
              {navesDisplayTemp.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        ) : (showingPastHumNaves ? (
          <section className={styles.panelAddData}>
            <div>
              <span>Recorded humidity %:</span>
              <Button variant="contained" size='small' onClick={() => setNavesDisplayHum([])}>Reset</Button>
            </div>
            <ul>
              {navesDisplayHum.length === 0 ? ('No data') : ''}
              {navesDisplayHum.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        ) : (showingPastMotionNaves ? (
          <section className={styles.panelAddData}>
            <div>
              <span>Recorded motion activity:</span>
              <Button variant="contained" size='small' onClick={() => setNavesDisplayMotion([])}>Reset</Button>
            </div>
            <ul>
              {navesDisplayMotion.length === 0 ? ('No data') : ''}
              {navesDisplayMotion.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        ) : (showingPastRainNaves ? (
          <section className={styles.panelAddData}>
            <div>
              <span>Recorded rain activity:</span>
              <Button variant="contained" size='small' onClick={() => setNavesDisplayRain([])}>Reset</Button>
            </div>
            <ul>
              {navesDisplayRain.length === 0 ? ('No data') : ''}
              {navesDisplayRain.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>
          </section>
        ) : (
          <div className={styles.graph}><WeatherChart rain_data={navesRainGraph} temp_data={navesTempGraph} index={2} /></div>
        ))))}

        <div className={styles.panelFrameCol}>
          <div className={navesMotion === 'YES' ? styles.redHighlight : styles.panelSubframe} onClick={() => setShowingPastMotionNaves((v) => !v)}>
            <span className={styles.panelReadings}>{navesMotion}</span>
            <span className={styles.panelSubreading}>Motion</span>
          </div>
          <div className={styles.panelSubframe}>
            <span className={styles.panelReadings}>{navesLastMotion[0]}</span>
            <span className={styles.panelSubreading}>{navesLastMotion[1]}</span>
            <span className={styles.panelSubreading}>Last motion</span>
          </div>
          <div className={navesCurrRain === 'YES' ? styles.blueHighlight : styles.panelSubframe} onClick={() => setShowingPastRainNaves((v) => !v)}>
            <span className={styles.panelReadings}>{navesCurrRain}</span>
            <span className={styles.panelSubreading}>Rain</span>
          </div>
          <div className={styles.panelSubframe}>
            <span className={styles.panelReadings}>{navesLastRain[0]}</span>
            <span className={styles.panelSubreading}>{navesLastRain[1]}</span>
            <span className={styles.panelSubreading}>Last rain</span>
          </div>
        </div>
      </section>

    </section>
  )
}
