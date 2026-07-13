const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const Notice = require('../models/Notice');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// GET /api/notices - Get all active notices (For both admin and realtors)
router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const notices = await Notice.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: notices });
  })
);

// POST /api/notices - Create a new notice (Admin only)
router.post(
  '/',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { title, message, type } = req.body;

    const notice = await Notice.create({
      title,
      message,
      type,
    });

    // Send email to all active partners if it's an urgent or success broadcast
    if (type === 'urgent' || type === 'success') {
      try {
        const partners = await User.find({ role: 'realtor', status: 'approved' });
        const emails = partners.map(p => p.email);

        if (emails.length > 0) {
          // Send bulk bcc to prevent exposing emails
          await resend.emails.send({
            from: 'GWealth Nation <hello@gwealthrepublic.com>',
            to: ['hello@gwealthrepublic.com'],
            bcc: emails,
            subject: type === 'urgent' ? `🚨 Urgent Update: ${title}` : `🎉 Good News: ${title}`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #333; max-w-2xl mx-auto; p-4;">
                <h2 style="color: #011C2B;">${title}</h2>
                <p style="white-space: pre-wrap; font-size: 16px; line-height: 1.5;">${message}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #666; font-size: 12px;">Log into your Partner Portal at <a href="https://portal.gwealthrepublic.com">portal.gwealthrepublic.com</a> to view more details.</p>
              </div>
            `
          });
          console.log(`Broadcast email sent to ${emails.length} partners.`);
        }
      } catch (emailErr) {
        console.error('Error sending broadcast email:', emailErr);
      }
    }

    res.status(201).json({ success: true, data: notice });
  })
);

// DELETE /api/notices/:id - Delete a notice (Admin only)
router.delete(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }

    await notice.deleteOne();
    res.json({ success: true, message: 'Notice removed' });
  })
);

// PUT /api/notices/:id - Update a notice (Admin only)
router.put(
  '/:id',
  protect,
  adminOnly,
  asyncHandler(async (req, res) => {
    const { title, message, type } = req.body;
    
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      res.status(404);
      throw new Error('Notice not found');
    }

    notice.title = title || notice.title;
    notice.message = message || notice.message;
    notice.type = type || notice.type;

    const updatedNotice = await notice.save();
    
    res.json({ success: true, data: updatedNotice });
  })
);

module.exports = router;
