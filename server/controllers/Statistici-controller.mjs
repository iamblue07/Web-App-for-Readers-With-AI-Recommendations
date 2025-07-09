import models from '../models/index.mjs';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
dotenv.config();

const getBazarStatistici = async (req, res) => {
  try {
    const [totalAnunt, openAnunt, closedAnunt] = await Promise.all([
      models.AnuntBazar.count(),
      models.AnuntBazar.count({ where: { esteDisponibil: true } }),
      models.AnuntBazar.count({ where: { esteDisponibil: false } }),
    ]);

    const priceDistribution = await models.AnuntBazar.findAll({
      attributes: [
        'pretAnunt',
        [Sequelize.fn('COUNT', Sequelize.col('pretAnunt')), 'count']
      ],
      group: ['pretAnunt'],
      order: [['pretAnunt', 'ASC']],
      raw: true
    });

    const genreDistribution = await models.AnuntBazar.findAll({
      attributes: [
        'genLiterar',
        [Sequelize.fn('COUNT', Sequelize.col('genLiterar')), 'count']
      ],
      group: ['genLiterar'],
      raw: true
    });

    const genreAvgPrice = await models.AnuntBazar.findAll({
      attributes: [
        'genLiterar',
        [Sequelize.fn('AVG', Sequelize.col('pretAnunt')), 'avgPrice']
      ],
      group: ['genLiterar'],
      raw: true
    });

    const allPricesRaw = await models.AnuntBazar.findAll({
      attributes: ['pretAnunt'],
      raw: true
    });
    const prices = allPricesRaw
      .map(r => parseFloat(r.pretAnunt))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);

    const n = prices.length;
    const quantile = q => {
      if (n === 0) return 0;
      const idx = (n - 1) * q;
      const lo = Math.floor(idx), hi = Math.ceil(idx);
      return lo === hi ? prices[lo] : (prices[lo] + prices[hi]) / 2;
    };

    const priceBoxplot = {
      min: prices[0] || 0,
      q1: quantile(0.25),
      median: quantile(0.5),
      q3: quantile(0.75),
      max: prices[n - 1] || 0
    };

    return res.status(200).json({
      totalAnunt,
      openAnunt,
      closedAnunt,
      priceDistribution,
      genreDistribution,
      genreAvgPrice,
      priceBoxplot
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getCartiStatistici = async (req, res) => {
  try {
    const totalBooks = await models.Carte.count();

    const genreCounts = await models.Carte.findAll({
      attributes: [
        'genLiterar',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      group: ['genLiterar'],
      raw: true
    });

    let topGenre = null;
    const genreStatsMap = {};
    genreCounts.forEach(({ genLiterar, count }) => {
      const cnt = parseInt(count, 10);
      const pct = (cnt / totalBooks) * 100;
      genreStatsMap[genLiterar] = {
        count: cnt,
        percentOfTotal: parseFloat(pct.toFixed(2))
      };
      if (topGenre === null || cnt > genreStatsMap[topGenre].count) {
        topGenre = genLiterar;
      }
    });

    const authorsRaw = await models.Carte.findAll({
      attributes: [
        'autor',
        [Sequelize.fn('MIN', Sequelize.col('OfertaCartes.pretOferta')), 'minPrice'],
        [Sequelize.fn('MAX', Sequelize.col('OfertaCartes.pretOferta')), 'maxPrice'],
        [Sequelize.fn('AVG', Sequelize.col('OfertaCartes.pretOferta')), 'avgPrice'],
        [Sequelize.fn('COUNT', Sequelize.fn('DISTINCT', Sequelize.col('Carte.id'))), 'volumes']
      ],
      include: [{ model: models.OfertaCarte, as: 'OfertaCartes', attributes: [] }],
      group: ['autor'],
      raw: true
    });

    const authorGenreRaw = await models.Carte.findAll({
      attributes: ['autor','genLiterar', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
      group: ['autor','genLiterar'],
      raw: true
    });

    const authorStats = authorsRaw.map(a => ({
      author: a.autor,
      minPrice: parseFloat(a.minPrice),
      maxPrice: parseFloat(a.maxPrice),
      avgPrice: parseFloat(parseFloat(a.avgPrice).toFixed(2)),
      volumes: parseInt(a.volumes, 10),
      genreDistribution: authorGenreRaw
         .filter(ag => ag.autor === a.autor)
         .map(ag => ({ genre: ag.genLiterar, count: parseInt(ag.count, 10) }))
    }));

    const priceDistRaw = await models.OfertaCarte.findAll({
      attributes: ['pretOferta', [Sequelize.col('Carte.genLiterar'), 'genLiterar']],
      include: [{ model: models.Carte, attributes: [] }],
      raw: true
    });

    const pricesByGenre = {};
    priceDistRaw.forEach(({ pretOferta, genLiterar }) => {
      const p = parseFloat(pretOferta);
      if (!pricesByGenre[genLiterar]) pricesByGenre[genLiterar] = [];
      if (!isNaN(p) && p > 0) pricesByGenre[genLiterar].push(p);
    });

    const genreStats = Object.entries(pricesByGenre).map(([gen, arr]) => {
      arr.sort((a,b) => a-b);
      const n = arr.length;
      const mean = arr.reduce((s,x) => s + x, 0) / n;
      const variance = arr.reduce((s,x) => s + Math.pow(x - mean, 2), 0) / n;
      const sd = Math.sqrt(variance);

      const min = arr[0], max = arr[n - 1];
      const step = (max - min) / 49;
      const normalDist = Array.from({ length: 50 }, (_, i) => {
        const x = min + step * i;
        const density = (1 / (sd * Math.sqrt(2 * Math.PI))) *
          Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
        return { price: parseFloat(x.toFixed(2)), density };
      });

      return {
        genre: gen,
        volumes: n,
        percentOfTotal: genreStatsMap[gen]?.percentOfTotal || 0,
        minPrice: min,
        maxPrice: max,
        avgPrice: parseFloat(mean.toFixed(2)),
        normalDist
      };
    });

    return res.status(200).json({
      totalBooks,
      topGenre,
      topGenrePercent: genreStatsMap[topGenre]?.percentOfTotal || 0,
      authorStats,
      genreStats
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export default {
  getBazarStatistici,
  getCartiStatistici
};
