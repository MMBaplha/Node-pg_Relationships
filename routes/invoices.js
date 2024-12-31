const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");
const router = new express.Router();

/* GET /invoices: Return all invoices */
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, comp_code FROM invoices ORDER BY id");
    return res.json({ invoices: result.rows });
  } catch (err) {
    return next(err);
  }
});

/* GET /invoices/:id: Return an invoice by ID */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT i.id, 
              i.amt, 
              i.paid, 
              i.add_date, 
              i.paid_date, 
              c.code AS comp_code, 
              c.name, 
              c.description 
       FROM invoices AS i
       JOIN companies AS c ON i.comp_code = c.code
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
    }

    const { amt, paid, add_date, paid_date, comp_code, name, description } = result.rows[0];
    return res.json({
      invoice: {
        id,
        amt,
        paid,
        add_date,
        paid_date,
        company: { code: comp_code, name, description },
      },
    });
  } catch (err) {
    return next(err);
  }
});

/* POST /invoices: Add a new invoice */
router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;

    const result = await db.query(
      `INSERT INTO invoices (comp_code, amt) 
       VALUES ($1, $2) 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );

    return res.status(201).json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/* PUT /invoices/:id: Update an invoice */
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;

    const result = await db.query(
      `UPDATE invoices 
       SET amt = $1 
       WHERE id = $2 
       RETURNING id, comp_code, amt, paid, add_date, paid_date`,
      [amt, id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
    }

    return res.json({ invoice: result.rows[0] });
  } catch (err) {
    return next(err);
  }
});

/* DELETE /invoices/:id: Delete an invoice */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;