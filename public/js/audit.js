let auditLogList = [];

async function loadAuditLog() {
  try {
    showLoading('audit-table');
    auditLogList = await auditAPI.getAll();
    renderAuditTable();
  } catch (error) {
    showError('audit-table', 'Failed to load audit log');
    console.error(error);
  }
}

function renderAuditTable() {
  const container = document.getElementById('audit-table');
  if (!container) return;

  if (auditLogList.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No audit logs found</p></div>';
    return;
  }

  const rows = auditLogList.map(log => `
    <tr>
      <td>${log.audit_id || log.id || '-'}</td>
      <td>${log.operation_type || '-'}</td>
      <td>${log.table_name || '-'}</td>
      <td>${log.record_id || '-'}</td>
      <td>${log.changed_by || '-'}</td>
      <td>${formatDate(log.changed_at)}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Operation</th>
            <th>Table</th>
            <th>Record ID</th>
            <th>Changed By</th>
            <th>Changed At</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  loadAuditLog();
});
