const db = require('../config/db');
const { ok, fail } = require('../utils/helpers');

// ── GET /api/dashboard/customer ───────────────────────────────────────────────
exports.customerStats = (req, res, next) => {
    try {
        const uid = req.user.id;

        const upcomingCount = (db.prepare('SELECT COUNT(*) AS cnt FROM appointments WHERE customerId = ? AND status = ?').get(uid, 'pending') || {}).cnt || 0;
        const completedCount = (db.prepare('SELECT COUNT(*) AS cnt FROM appointments WHERE customerId = ? AND status = ?').get(uid, 'completed') || {}).cnt || 0;
        const deviceCount = (db.prepare('SELECT COUNT(*) AS cnt FROM devices WHERE userId = ?').get(uid) || {}).cnt || 0;

        const recentAppointments = db.prepare(`
      SELECT a.id, a.appointmentDate, a.status, s.shopName, d.deviceType, svc.serviceName
      FROM appointments a
      JOIN shops s ON s.id = a.shopId
      JOIN devices d ON d.id = a.deviceId
      JOIN services svc ON svc.id = a.serviceId
      WHERE a.customerId = ?
      ORDER BY a.appointmentDate DESC
      LIMIT 5
    `).all(uid);

        return ok(res, {
            stats: {
                upcoming: upcomingCount,
                completed: completedCount,
                devices: deviceCount
            },
            recentAppointments
        });
    } catch (err) { next(err); }
};

// ── GET /api/dashboard/shop ──────────────────────────────────────────────────
exports.shopStats = (req, res, next) => {
    try {
        const shop = db.prepare('SELECT id FROM shops WHERE userId = ?').get(req.user.id);
        if (!shop) return fail(res, 'Shop not found', 404);

        const pendingCount = (db.prepare('SELECT COUNT(*) AS cnt FROM appointments WHERE shopId = ? AND status = ?').get(shop.id, 'pending') || {}).cnt || 0;
        const completedCount = (db.prepare('SELECT COUNT(*) AS cnt FROM appointments WHERE shopId = ? AND status = ?').get(shop.id, 'completed') || {}).cnt || 0;

        const recentAppointments = db.prepare(`
      SELECT a.*, u.fullName as customerName FROM appointments a
      JOIN users u ON u.id = a.customerId
      WHERE a.shopId = ?
      ORDER BY a.appointmentDate DESC
      LIMIT 5
    `).all(shop.id);

        return ok(res, {
            stats: {
                pending: pendingCount,
                completed: completedCount
            },
            recentAppointments
        });
    } catch (err) { next(err); }
};

JOIN devices d ON d.id = a.device_id
JOIN services s ON s.id = a.service_id
WHERE a.customer_id = ? AND a.status NOT IN('cancelled', 'completed')
ORDER BY a.appointment_date ASC
LIMIT 5 `,
      [uid]
    );

    return ok(res, {
      stats: {
        upcoming:  counts.upcoming  || 0,
        active:    counts.active    || 0,
        completed: counts.completed || 0,
        confirmed: counts.confirmed || 0,
        devices:   deviceCount.total || 0,
      },
      activeAppointments: recent,
    });
  } catch (err) { next(err); }
};

// ── GET /api/dashboard/shop ───────────────────────────────────────────────────
exports.shopStats = async (req, res, next) => {
  try {
    const [sp] = await pool.query(
      'SELECT id, rating, review_count, status FROM shop_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (!sp.length) return fail(res, 'Shop not found', 404);
    const shopId = sp[0].id;
    const today  = new Date().toISOString().split('T')[0];

    const [[todayCounts]] = await pool.query(
      `
SELECT
COUNT( * ) AS total_today,
    SUM(status = 'in_progress') AS in_progress,
    SUM(status = 'pending') AS pending,
    SUM(status = 'confirmed') AS confirmed,
    SUM(status = 'completed') AS completed_today
FROM appointments
WHERE shop_id = ? AND appointment_date = ? `,
      [shopId, today]
    );

    const [[allTime]] = await pool.query(
      `
SELECT
COUNT( * ) AS total_all_time,
    SUM(status = 'completed') AS total_completed,
    COUNT(DISTINCT customer_id) AS unique_customers
FROM appointments WHERE shop_id = ? `,
      [shopId]
    );

    const [todayApts] = await pool.query(
      `
SELECT
a.id, a.booking_ref, a.appointment_time AS time, a.status,
    CONCAT(cp.first_name, ' ', cp.last_name) AS customer_name,
    u.phone AS customer_phone,
    d.name AS device, d.device_type,
    s.name AS service
FROM appointments a
JOIN users u ON u.id = a.customer_id
JOIN customer_profiles cp ON cp.user_id = a.customer_id
JOIN devices d ON d.id = a.device_id
JOIN services s ON s.id = a.service_id
WHERE a.shop_id = ? AND a.appointment_date = ?
    ORDER BY a.appointment_time ASC `,
      [shopId, today]
    );

    return ok(res, {
      stats: {
        todayTotal:       todayCounts.total_today        || 0,
        inProgress:       todayCounts.in_progress        || 0,
        pending:          todayCounts.pending             || 0,
        confirmed:        todayCounts.confirmed           || 0,
        completedToday:   todayCounts.completed_today     || 0,
        totalAllTime:     allTime.total_all_time         || 0,
        totalCompleted:   allTime.total_completed        || 0,
        uniqueCustomers:  allTime.unique_customers       || 0,
        rating:           sp[0].rating,
        reviewCount:      sp[0].review_count,
      },
      todaySchedule: todayApts,
    });
  } catch (err) { next(err); }
};