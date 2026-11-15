# Realty Adwise Portal: Role Responsibilities

This document summarizes what each role can do in the current backend portal.

## Admin

The Admin has full system-level control:

- View the dashboard, leads, customers, properties, managers, and executives.
- Create, edit, activate/deactivate, reset passwords for, and delete managers.
- Create, edit, activate/deactivate, reset passwords for, and delete executives.
- Assign or remove executives from managers.
- Create and manage properties, including activating/deactivating properties.
- Select which executives receive leads for each property.
- View assignment history for each property.
- Configure the lead assignment rule and response-time timeout.
- Create, view, update status, assign, transfer, or split leads.
- Edit customer information and view customer lead history.
- View manager and executive performance/details.

## Manager

The Manager manages their assigned team and its leads:

- View the manager dashboard and assigned executives.
- View leads belonging to their team.
- Create new leads and assign them to an executive.
- Assign pending leads to an executive.
- Update lead status.
- Transfer a lead to another executive.
- Split a property enquiry between executives.
- Mark leads as important and manage follow-ups.
- Add, edit, and delete personal notes.
- View customer information and lead history.
- Copy or share lead information through WhatsApp.
- Receive realtime lead and SLA notifications.

## Executive

The Executive works on their own assigned leads:

- View the executive dashboard and personal lead list.
- Search and filter assigned leads by status, source, importance, and follow-up.
- Open lead and customer details.
- Update the status of their own leads.
- Mark leads as important and manage follow-ups.
- Add, edit, and delete personal notes.
- Call customers and open WhatsApp conversations.
- Receive realtime assignment, status, and SLA notifications.

## Lead Assignment Summary

- Admin selects the executives available for each property.
- New leads are assigned using the configured assignment rule, normally round-robin.
- The rotation is maintained separately for each property.
- Inactive executives are skipped.
- Leads remain pending if no eligible executive is available.
- Manual assignment does not change the automatic round-robin turn.
- If a response-time timeout expires, the lead can move to the next eligible executive.

