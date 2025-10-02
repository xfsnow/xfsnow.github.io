# Viewing winmail.dat Attachments and Configuration to Avoid This Issue

Published: *2011-03-13 21:42:00*

Category: __System__

Summary: Introduction to viewing winmail.dat attachments and configuration to avoid this issue.

---------

## Problem Description

Sometimes we receive a large attachment named winmail.dat in our emails, but no program can open it. This is actually a "feature" of Microsoft Exchange. Exchange supports rich text emails, which include font formatting and other features, but other email systems don't support this. When emails are sent from Exchange to non-Exchange email accounts, the email becomes an attachment, usually called winmail.dat, occasionally with other names. If you open it in plain text mode, you'll see a file format declaration like IPM.Microsoft Mail.Note at the file header.

If you also use Exchange, you can naturally receive emails normally without this attachment. But if you don't use Exchange, as is the case with the vast majority of netizens, you receive an attachment that's difficult to view.

## Solutions

### Method 1: Using Specialized Tools

To view this file, I've uploaded a dedicated tool to CSDN downloads. It's a portable Windows program that can be used after extraction.

<http://download.csdn.net/source/3088167>

### Method 2: Using Online Services

For non-Windows users, or those who don't want to use this program, you can also use the following free online service websites:

<http://www.winmaildat.com/>

The limitation of this website is that uploaded files cannot exceed 5MB.

## Preventive Measures

Finally, I recommend the following settings for MS Outlook and Outlook Express users to avoid emails being sent to others as large winmail.dat attachments.

In the Tools menu, select Options, then go to the "Mail Format" or "Send" tab. In the mail sending format section, select Plain Text or HTML, but never select Rich Text format. That's it.