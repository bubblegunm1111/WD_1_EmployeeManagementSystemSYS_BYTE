const { getAuth } = require('firebase-admin/auth');
const { getDbConnection } = require('../db');

// Middleware to verify Firebase token and attach organization_id
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    req.user = decodedToken; // { uid, email, etc. }
    
    // Resolve organization_id
    const db = await getDbConnection();
    
    // First, check if the user is an Admin (owner of an organization)
    let org = await db.get('SELECT id FROM organizations WHERE admin_firebase_uid = ?', [decodedToken.uid]);
    
    // Auto-claim the default organization for the main admin if they haven't claimed it yet
    if (!org && decodedToken.email === 'sys1.admin.system@gmail.com') {
      const defaultOrg = await db.get('SELECT id FROM organizations WHERE admin_firebase_uid = ?', ['sys1-admin-default-uid']);
      if (defaultOrg) {
        await db.run('UPDATE organizations SET admin_firebase_uid = ? WHERE id = ?', [decodedToken.uid, defaultOrg.id]);
        org = defaultOrg;
      }
    }
    
    if (org) {
      req.organization_id = org.id;
      req.role = 'admin';
    } else {
      // If not an admin, check if they are an employee
      const emp = await db.get('SELECT organization_id FROM employees WHERE firebase_uid = ?', [decodedToken.uid]);
      
      if (emp && emp.organization_id) {
        req.organization_id = emp.organization_id;
        req.role = 'employee';
      } else {
        // Not an admin, not an employee with an org -> no access
        return res.status(403).json({ error: 'Forbidden: User does not belong to any organization' });
      }
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = { requireAuth };
