const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is not set. Point it at your local or Neon database before seeding.');
  process.exit(1);
}

const seedEmail = process.env.SEED_ADMIN_EMAIL || 'admin@vigil.local';
const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!';

const pool = new Pool({ connectionString });

async function seed() {
  const client = await pool.connect();

  try {
    console.log('Seeding database...');

    // Create investigator account
    const passwordHash = await bcrypt.hash(seedPassword, 10);
    await client.query(`
      INSERT INTO investigators (email, password_hash, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, [seedEmail, passwordHash]);
    console.log(`✓ Investigator created: ${seedEmail} / ${seedPassword}`);

    // Seed demo reports + cases
    const demoReports = [
      {
        token: 'a1b2c3d4-0001-0001-0001-000000000001',
        description: 'The CFO has been inflating travel and entertainment expenses for the past 8 months. I have seen receipts for personal vacations being submitted as business travel. Estimated amount is around 45 lakhs.',
        fraud_type: 'expense_fraud',
        severity: 'high',
        urgency: 'urgent',
        department: 'Finance',
        amount: 4500000,
        status: 'under_investigation',
        regulatory_flag: false,
        ai_summary: 'Senior finance executive allegedly misappropriating company funds through falsified expense claims. Pattern of behavior observed over extended period suggests systematic fraud.',
      },
      {
        token: 'a1b2c3d4-0002-0002-0002-000000000002',
        description: 'Our procurement head is accepting kickbacks from vendor Sharma Enterprises. Every large contract above 50 lakhs goes to them regardless of bid quality. The head receives cash payments monthly.',
        fraud_type: 'bribery',
        severity: 'critical',
        urgency: 'immediate',
        department: 'Procurement',
        amount: 12000000,
        status: 'new',
        regulatory_flag: true,
        ai_summary: 'Procurement official allegedly engaged in systematic bribery scheme with external vendor. Regulatory thresholds exceeded requiring immediate escalation.',
      },
      {
        token: 'a1b2c3d4-0003-0003-0003-000000000003',
        description: 'I believe a senior VP sold company shares two weeks before our Q3 results were announced publicly. He knew about the revenue miss in advance. He sold around 2 crore worth of shares.',
        fraud_type: 'insider_trading',
        severity: 'critical',
        urgency: 'immediate',
        department: 'Executive',
        amount: 20000000,
        status: 'under_investigation',
        regulatory_flag: true,
        ai_summary: 'Alleged insider trading by executive with access to material non-public information. SEBI reporting obligation triggered given amount and nature of violation.',
      },
      {
        token: 'a1b2c3d4-0004-0004-0004-000000000004',
        description: 'There are ghost employees on the payroll in the warehouse division. At least 4-5 names that I have never seen working here. Someone is collecting their salaries.',
        fraud_type: 'payroll_fraud',
        severity: 'medium',
        urgency: 'urgent',
        department: 'HR',
        amount: 800000,
        status: 'pending_review',
        regulatory_flag: false,
        ai_summary: 'Alleged payroll fraud involving fictitious employees in warehouse operations. Systematic embezzlement through HR systems suspected.',
      },
      {
        token: 'a1b2c3d4-0005-0005-0005-000000000005',
        description: 'A manager in IT is selling customer data to competitors. I saw him exporting large CSV files and emailing them to a personal Gmail account late at night.',
        fraud_type: 'data_theft',
        severity: 'high',
        urgency: 'immediate',
        department: 'IT',
        amount: null,
        status: 'resolved',
        regulatory_flag: false,
        ai_summary: 'IT employee allegedly exfiltrating sensitive customer data for commercial gain. Data protection and confidentiality violations with potential regulatory implications.',
      },
    ];

    for (const r of demoReports) {
      const reportResult = await client.query(`
        INSERT INTO reports (anonymous_token, description, fraud_type, severity, urgency, department, amount, status, regulatory_flag, ai_summary)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (anonymous_token) DO NOTHING
        RETURNING id
      `, [r.token, r.description, r.fraud_type, r.severity, r.urgency, r.department, r.amount, r.status, r.regulatory_flag, r.ai_summary]);

      if (reportResult.rows.length > 0) {
        const reportId = reportResult.rows[0].id;
        const steps = JSON.stringify([
          'Secure and preserve all relevant documentation immediately',
          'Conduct confidential interviews with key witnesses',
          'Engage forensic accountants for financial analysis',
        ]);

        await client.query(`
          INSERT INTO cases (report_id, assigned_to, status, ai_steps, notes)
          VALUES ($1, 1, $2, $3, $4)
        `, [reportId, r.status, steps, 'Case auto-created from whistleblower report. AI triage completed.']);

        await client.query(`
          INSERT INTO audit_log (action, actor, target_id, target_type)
          VALUES ('REPORT_SUBMITTED', 'anonymous', $1, 'report')
        `, [reportId]);

        await client.query(`
          INSERT INTO audit_log (action, actor, target_id, target_type)
          VALUES ('CASE_CREATED', 'system', $1, 'report')
        `, [reportId]);

        await client.query(`
          INSERT INTO messages (report_id, sender_role, content)
          VALUES ($1, 'investigator', 'Thank you for your report. We have received it and an investigator has been assigned. Can you provide any additional documentation or specific dates?')
        `, [reportId]);
      }
    }

    console.log('✓ Demo cases seeded');
    console.log('\nDone! You can now login at http://localhost:3000/login');
    console.log(`Email: ${seedEmail}`);
    console.log(`Password: ${seedPassword}`);

  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();