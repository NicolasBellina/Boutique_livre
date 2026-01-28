/**
 * Générateur de factures HTML/PDF
 * Crée une facture HTML pour impression/téléchargement
 */

export function generateInvoiceHTML(order) {
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('fr-FR');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture ${order.orderNumber}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            color: #2c3e50;
            background-color: #f8f9fa;
            padding: 20px;
        }
        
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #3498db;
        }
        
        .company-info h1 {
            font-size: 28px;
            color: #3498db;
            margin-bottom: 10px;
        }
        
        .company-info p {
            font-size: 14px;
            color: #7f8c8d;
            margin: 5px 0;
        }
        
        .invoice-info {
            text-align: right;
        }
        
        .invoice-info h2 {
            font-size: 24px;
            color: #2c3e50;
            margin-bottom: 10px;
        }
        
        .invoice-info p {
            font-size: 14px;
            color: #7f8c8d;
            margin: 5px 0;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h3 {
            font-size: 14px;
            font-weight: 700;
            color: #2c3e50;
            text-transform: uppercase;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .section-content {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .section-item {
            font-size: 14px;
        }
        
        .section-item strong {
            display: block;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .section-item span {
            color: #7f8c8d;
        }
        
        .table {
            width: 100%;
            margin-bottom: 30px;
            border-collapse: collapse;
        }
        
        .table-header {
            background-color: #ecf0f1;
            border-bottom: 2px solid #bdc3c7;
        }
        
        .table th {
            padding: 12px;
            text-align: left;
            font-weight: 700;
            color: #2c3e50;
            font-size: 13px;
        }
        
        .table td {
            padding: 15px 12px;
            border-bottom: 1px solid #ecf0f1;
            font-size: 14px;
        }
        
        .table td:nth-child(2),
        .table td:nth-child(3),
        .table td:nth-child(4) {
            text-align: right;
        }
        
        .table tr:last-child td {
            border-bottom: none;
        }
        
        .summary {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 40px;
        }
        
        .summary-table {
            width: 300px;
        }
        
        .summary-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ecf0f1;
            font-size: 14px;
        }
        
        .summary-row strong {
            font-weight: 600;
        }
        
        .summary-row.total {
            border-top: 2px solid #3498db;
            border-bottom: none;
            padding: 15px 0;
            font-size: 16px;
            font-weight: 700;
            color: #27ae60;
        }
        
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
        }
        
        .status-badge {
            display: inline-block;
            padding: 8px 12px;
            border-radius: 4px;
            font-weight: 600;
            font-size: 12px;
        }
        
        .status-confirmed {
            background-color: #e6f9f0;
            color: #27ae60;
        }
        
        .status-pending {
            background-color: #fff9e6;
            color: #f39c12;
        }
        
        .status-cancelled {
            background-color: #f9e6e6;
            color: #e74c3c;
        }
        
        @media print {
            body {
                background-color: white;
                padding: 0;
            }
            
            .container {
                box-shadow: none;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <h1>📚 LibrairiePro</h1>
                <p>Votre librairie en ligne</p>
                <p>Email: contact@librairiepro.fr</p>
                <p>Téléphone: +33 (0)1 23 45 67 89</p>
            </div>
            <div class="invoice-info">
                <h2>FACTURE</h2>
                <p><strong>N° ${order.orderNumber}</strong></p>
                <p>Date: ${invoiceDate}</p>
                <p class="status-badge status-${order.status}">
                    ${order.status === 'confirmed' ? '✅ Confirmée' : 
                      order.status === 'pending' ? '⏳ En attente' : 
                      '❌ Annulée'}
                </p>
            </div>
        </div>
        
        <!-- Client Info -->
        <div class="section">
            <h3>Client</h3>
            <div class="section-content">
                <div class="section-item">
                    <strong>${order.customerName || 'Non spécifié'}</strong>
                    <span>${order.customerEmail || 'Non spécifié'}</span>
                </div>
                <div class="section-item">
                    <strong>Adresse de livraison</strong>
                    <span>${order.shippingAddress || 'Non spécifiée'}</span>
                </div>
            </div>
        </div>
        
        <!-- Items Table -->
        <table class="table">
            <thead class="table-header">
                <tr>
                    <th>Produit</th>
                    <th>Quantité</th>
                    <th>Prix Unitaire</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(item => `
                <tr>
                    <td>
                        <strong>${item.book?.title || 'Produit'}</strong><br>
                        <span style="font-size: 12px; color: #7f8c8d;">
                            par ${item.book?.author || 'Auteur inconnu'}
                        </span>
                    </td>
                    <td>${item.quantity}</td>
                    <td>${parseFloat(item.unitPrice).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</td>
                    <td><strong>${(parseFloat(item.unitPrice) * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</strong></td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        
        <!-- Summary -->
        <div class="summary">
            <div class="summary-table">
                <div class="summary-row">
                    <strong>Nombre d'articles:</strong>
                    <span>${totalItems}</span>
                </div>
                <div class="summary-row">
                    <strong>Sous-total:</strong>
                    <span>${parseFloat(order.total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div class="summary-row">
                    <strong>TVA (20%):</strong>
                    <span>${(parseFloat(order.total) * 0.20).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div class="summary-row total">
                    <strong>TOTAL À PAYER:</strong>
                    <span>${(parseFloat(order.total) * 1.20).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
            </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
            <p>Merci pour votre commande! 🎉</p>
            <p>Pour toute question, veuillez nous contacter à contact@librairiepro.fr</p>
            <p style="margin-top: 10px; font-size: 11px;">
                LibrairiePro © 2026 - Tous droits réservés
            </p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Télécharger la facture en format HTML (pouvant être imprimée en PDF)
 */
export function downloadInvoice(order) {
  const html = generateInvoiceHTML(order);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `${order.orderNumber}_facture.html`;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Imprimer la facture directement
 */
export function printInvoice(order) {
  const html = generateInvoiceHTML(order);
  const printWindow = window.open('', '', 'height=800,width=900');

  printWindow.document.write(html);
  printWindow.document.close();

  // Attendre que la page se charge avant d'imprimer
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
