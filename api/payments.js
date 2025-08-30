const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');

router.post('/verify', async (req, res) => {
    try {
        const { reference, invoiceNumber, amount, status } = req.body;

        // Validate required fields
        if (!reference || !invoiceNumber || !amount || !status) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: reference, invoiceNumber, amount, status'
            });
        }

        // Find the invoice
        const invoice = await Invoice.findOne({ invoiceNumber });
        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        // Verify payment amount matches
        if (parseFloat(amount) !== invoice.amount) {
            return res.status(400).json({
                success: false,
                message: 'Payment amount does not match invoice amount'
            });
        }

        // Update invoice status based on payment status
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

        invoice.paymentStatus = paymentStatus;
        invoice.paymentReference = reference;
        await invoice.save();

        res.json({
            success: true,
            message: `Payment ${paymentStatus} successfully`,
            invoice: {
                invoiceNumber: invoice.invoiceNumber,
                client: invoice.client,
                amount: invoice.amount,
                paymentStatus: invoice.paymentStatus,
                paymentReference: invoice.paymentReference
            }
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
        const { invoiceNumber } = req.params;
        const invoice = await Invoice.findOne({ invoiceNumber });

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
        const invoices = await Invoice.find().sort({ createdAt: -1 });
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

        const invoice = new Invoice({
            invoiceNumber,
            client,
            amount,
            dueDate: new Date(dueDate),
            paymentStatus: 'pending'
        });

        await invoice.save();

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

