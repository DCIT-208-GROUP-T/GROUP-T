const express = require('express');
const router = express.Router();
const {
  getInvoiceByNumber,
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../models/InvoiceFirestore');

router.post('/verify', async (req, res) => {
  try {
    const { reference, invoiceNumber, amount, status } = req.body;

    if (!reference || !invoiceNumber || !amount || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: reference, invoiceNumber, amount, status'
      });
    }

    const invoice = await getInvoiceByNumber(invoiceNumber);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    if (parseFloat(amount) !== invoice.amount) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount does not match invoice amount'
      });
    }

    let paymentStatus;
    if (status === 'success') {
      paymentStatus = 'paid';
    } else if (status === 'failed') {
      paymentStatus = 'failed';
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status'
      });
    }

    const updatedInvoice = await updateInvoice(invoice.id, {
      paymentStatus,
      paymentReference: reference
    });

    res.json({
      success: true,
      message: `Payment ${paymentStatus} successfully`,
      invoice: updatedInvoice
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during payment verification'
    });
  }
});

router.get('/invoice/:invoiceNumber', async (req, res) => {
  try {
    const invoice = await getInvoiceByNumber(req.params.invoiceNumber);
    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    res.json({
      success: true,
      invoice
    });
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.get('/invoices', async (req, res) => {
  try {
    const invoices = await getAllInvoices();
    res.json({
      success: true,
      invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

router.post('/test-invoice', async (req, res) => {
  try {
    const { invoiceNumber, client, amount, dueDate } = req.body;

    const invoice = await createInvoice({
      invoiceNumber,
      client,
      amount,
      dueDate: new Date(dueDate),
      paymentStatus: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({
      success: true,
      message: 'Test invoice created successfully',
      invoice
    });
  } catch (error) {
    console.error('Create test invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;

