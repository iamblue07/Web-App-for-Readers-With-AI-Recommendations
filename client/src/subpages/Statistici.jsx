// src/components/Statistici/Statistici.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";
import config from "../utils/config";
import Incarcare from "../components/Incarcare/Incarcare";
import "../styles/Statistici.css";

const COLORS = [
  "#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A",
  "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658"
];

const Statistici = () => {
  const [categorieStatistici, setCategorieStatistici] = useState(1);

  const [anunturiData, setAnunturiData] = useState({
    lineChartData: [], pieChartData: [], barChartData: [], boxPlotData: [],
    totalAnunt: 0, openAnunt: 0, closedAnunt: 0
  });
  const [cartiData, setCartiData] = useState({
    totalBooks: 0, topGenre: "", topGenrePercent: 0,
    authorStats: [], genreStats: []
  });

  const [anunturiCache, setAnunturiCache] = useState(null);
  const [cartiCache, setCartiCache] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const [selectedAuthor, setSelectedAuthor] = useState("");
  const [authorStats, setAuthorStats] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genreStats, setGenreStats] = useState(null);

  const authors = useMemo(
    () => Array.isArray(cartiData.authorStats) ? cartiData.authorStats.map(a => a.author).sort() : [],
    [cartiData.authorStats]
  );
  const genres = useMemo(
    () => Array.isArray(cartiData.genreStats) ? cartiData.genreStats.map(g => g.genre).sort() : [],
    [cartiData.genreStats]
  );

  const fetchAnunturi = async () => {
    try {
      const res = await fetch(`${config.API_URL}/statistici/anunturi`);
      if (!res.ok) throw new Error("Failed to fetch Anunțuri stats");
      const d = await res.json();
      const pieData = (d.genreDistribution || []).map(item => ({ name: item.genLiterar, value: +item.count }));
      const topPie = pieData.sort((a, b) => b.value - a.value).slice(0, 5);
      const formatted = {
        totalAnunt: d.totalAnunt,
        openAnunt: d.openAnunt,
        closedAnunt: d.closedAnunt,
        lineChartData: (d.priceDistribution || []).map(item => ({ price: +item.pretAnunt, volume: +item.count })),
        pieChartData: topPie,
        barChartData: (d.genreAvgPrice || []).map(item => ({ category: item.genLiterar, count: +item.avgPrice })),
        boxPlotData: [{
          name: "Preț anunț",
          min: d.priceBoxplot.min,
          q1: d.priceBoxplot.q1,
          median: d.priceBoxplot.median,
          q3: d.priceBoxplot.q3,
          max: d.priceBoxplot.max
        }]
      };
      setAnunturiCache(formatted);
      setAnunturiData(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDataLoaded(true);
    }
  };

  const fetchCarti = async () => {
    try {
      const res = await fetch(`${config.API_URL}/statistici/carti`);
      if (!res.ok) throw new Error("Failed to fetch Cărți stats");
      const d = await res.json();
      setCartiCache(d);
      setCartiData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    setIsDataLoaded(false);
    if (categorieStatistici === 0) {
      if (anunturiCache) {
        setAnunturiData(anunturiCache);
        setIsDataLoaded(true);
      } else {
        fetchAnunturi();
      }
    } else {
      if (cartiCache) {
        setCartiData(cartiCache);
        setIsDataLoaded(true);
      } else {
        fetchCarti();
      }
    }
  }, [categorieStatistici]);

  const handleAuthorChange = (e) => {
    const author = e.target.value;
    setSelectedAuthor(author);
    if (!author) {
      setAuthorStats(null);
      return;
    }
    const found = cartiData.authorStats.find(a => a.author === author);
    if (!found) {
      setAuthorStats(null);
      return;
    }
    setAuthorStats({
      minPrice: found.minPrice.toFixed(2),
      maxPrice: found.maxPrice.toFixed(2),
      avgPrice: found.avgPrice.toFixed(2),
      count: found.volumes,
      genreDistribution: found.genreDistribution
    });
  };

  const handleGenreChange = (e) => {
    const genre = e.target.value;
    setSelectedGenre(genre);
    if (!genre) {
      setGenreStats(null);
      return;
    }
    const found = cartiData.genreStats.find(g => g.genre === genre);
    if (!found) {
      setGenreStats(null);
      return;
    }
    setGenreStats({
      minPrice: found.minPrice.toFixed(2),
      maxPrice: found.maxPrice.toFixed(2),
      avgPrice: found.avgPrice.toFixed(2),
      count: found.volumes,
      percent: found.percentOfTotal,
      normalDist: found.normalDist
    });
  };

  if (!isDataLoaded) return <Incarcare />;

  return (
    <div className="statistici-container">
      <h1 className="statistici-title">Statistici</h1>
      <div className="radio-buttons">
        <label>
          <input
            type="radio"
            name="category"
            checked={categorieStatistici === 0}
            onChange={() => setCategorieStatistici(0)}
          />
          Anunturi
        </label>
        <label>
          <input
            type="radio"
            name="category"
            checked={categorieStatistici === 1}
            onChange={() => setCategorieStatistici(1)}
          />
          Carti
        </label>
      </div>

      {categorieStatistici === 0 && (
        <>
          <h3>Distributie Pret Anunturi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={anunturiData.lineChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="price"
                label={{ value: 'Preț', position: 'insideBottomRight', offset: -5 }}
              />
              <YAxis
                label={{ value: 'Nr. volume', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#8884d8"
                name="Volum"
              />
            </LineChart>
          </ResponsiveContainer>

          <h3>Distributie Genuri (Top 5)</h3>
          {anunturiData.pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={anunturiData.pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {anunturiData.pieChartData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="chart-placeholder">Nu există date pentru genuri.</p>
          )}

          <h3>Pret Mediu pe Gen</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={anunturiData.barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line dataKey="count" stroke="#8884d8" name="Preț mediu" />
            </LineChart>
          </ResponsiveContainer>

        <h3>Boxplot Preț Anunțuri</h3>
        <ResponsiveContainer width="100%" height={350}>
            <LineChart
                data={anunturiData.boxPlotData}
                margin={{ top: 30, right: 40, left: 20, bottom: 5 }}
            >
                {/* subtle grid */}
                <CartesianGrid strokeDasharray="3 3" />

                {/* X axis with padding so labels don’t hug edges */}
                <XAxis dataKey="name" padding={{ left: 10, right: 10 }} />

                {/* Y axis with label */}
                <YAxis
                domain={['dataMin', 'dataMax']}
                allowDecimals={false}
                label={{ value: 'Preț (lei)', angle: -90, position: 'insideLeft' }}
                />

                <Tooltip formatter={value => value.toFixed(2)} />
                <Legend verticalAlign="top" height={36} />

                <Line
                dataKey="min"
                name="Min"
                stroke="#ccc"
                strokeWidth={4}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls
                />
                <Line
                dataKey="q1"
                name="Q1"
                stroke="#8884d8"
                strokeWidth={4}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls
                />
                <Line
                dataKey="median"
                name="Mediană"
                stroke="#82ca9d"
                strokeWidth={4}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                strokeDasharray="5 5"
                connectNulls
                />
                <Line
                dataKey="q3"
                name="Q3"
                stroke="#d0ed57"
                strokeWidth={4}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls
                />
                <Line
                dataKey="max"
                name="Max"
                stroke="#ffc658"
                strokeWidth={4}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
                connectNulls
                />
            </LineChart>
        </ResponsiveContainer>


        </>
      )}

      {categorieStatistici === 1 && (
        <>
          <h3>Rezumat Carti</h3>
          <div className="summary-box">
            Total carti: {cartiData.totalBooks} | Genul literar predominant: <strong>{cartiData.topGenre}</strong> ({cartiData.topGenrePercent}%)
          </div>

          <h3>Distributie Autori</h3>
          <div className="statistici-row">
            <div className="statistici-col filter-box">
              <input
                type="text"
                placeholder="Caută autor"
                value={selectedAuthor}
                onChange={handleAuthorChange}
                list="authors-list"
                className="input-search"
              />
              <datalist id="authors-list">
                {authors.map(auth => (
                  <option key={auth} value={auth} />
                ))}
              </datalist>
              {authorStats && (
                <div className="stats-output">
                  <p>Pret minim: {authorStats.minPrice}</p>
                  <p>Pret maxim: {authorStats.maxPrice}</p>
                  <p>Pret mediu: {authorStats.avgPrice}</p>
                  <p>Nr. volume: {authorStats.count}</p>
                </div>
              )}
            </div>
            <div className="statistici-col chart-box">
              {authorStats ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={authorStats.genreDistribution.map(g => ({ name: g.genre, value: g.count }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {authorStats.genreDistribution.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="chart-placeholder">Introduceti un autor.</p>
              )}
            </div>
          </div>

          <h3>Distributie Gen Literar</h3>
          <div className="statistici-row">
            <div className="statistici-col filter-box">
              <select
                value={selectedGenre}
                onChange={handleGenreChange}
                className="select-genre"
              >
                <option value="">Selectati gen literar</option>
                {genres.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              {genreStats && (
                <div className="stats-output">
                  <p>Pret minim: {genreStats.minPrice}</p>
                  <p>Pret maxim: {genreStats.maxPrice}</p>
                  <p>Pret mediu: {genreStats.avgPrice}</p>
                  <p>Nr. volume: {genreStats.count}</p>
                  <p>Procent din total: {genreStats.percent}%</p>
                </div>
              )}
            </div>
            <div className="statistici-col chart-box">
              {genreStats ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={genreStats.normalDist}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="price"
                      label={{ value: 'Preț', position: 'insideBottomRight', offset: -5 }}
                      type="number"
                      domain={['dataMin', 'dataMax']}
                    />
                    <YAxis
                      label={{ value: 'Densitate', angle: 0, position: 'insideTop' }}
                    />
                    <Tooltip formatter={value => value.toFixed(4)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="density"
                      name="Curba Normala"
                      stroke={COLORS[0]}
                      fill={COLORS[0]}
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="chart-placeholder">Selectati un gen.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Statistici;
