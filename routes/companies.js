const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

// GET /companies : Returns list of companies
router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT code, name FROM companies ORDER BY name`);
    return res.json({ companies: results.rows });
  } catch (e) {
    return next(e);
  }
});

// GET /companies/[code] : Returns a specific company by code
router.get("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const compResult = await db.query(
      `SELECT code, name, description FROM companies WHERE code = $1`,
      [code]
    );

    const invResult = await db.query(
      `SELECT id FROM invoices WHERE comp_code = $1`,
      [code]
    );

    if (compResult.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    const company = compResult.rows[0];
    const invoices = invResult.rows;
    company.invoices = invoices.map(inv => inv.id);

    return res.json({ company });
  } catch (e) {
    return next(e);
  }
});

// POST /companies : Adds a new company
router.post("/", async (req, res, next) => {
  try {
    const { code, name, description } = req.body;

    if (!code || !name || !description) {
      throw new ExpressError("Code, name, and description are required", 400);
    }

    const result = await db.query(
      `INSERT INTO companies (code, name, description) 
       VALUES ($1, $2, $3) 
       RETURNING code, name, description`,
      [code, name, description]
    );

    return res.status(201).json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// PUT /companies/[code] : Updates an existing company
router.put("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      throw new ExpressError("Name and description are required", 400);
    }

    const result = await db.query(
      `UPDATE companies 
       SET name = $1, description = $2 
       WHERE code = $3 
       RETURNING code, name, description`,
      [name, description, code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    return res.json({ company: result.rows[0] });
  } catch (e) {
    return next(e);
  }
});

// DELETE /companies/[code] : Deletes a company
router.delete("/:code", async (req, res, next) => {
  try {
    const { code } = req.params;

    const result = await db.query(
      `DELETE FROM companies WHERE code = $1 RETURNING code`,
      [code]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`No such company: ${code}`, 404);
    }

    return res.json({ status: "deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;