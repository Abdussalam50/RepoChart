# RepoChart

## 1. Product Overview
**RepoChart** is a web-based SaaS tool that helps digital marketing freelancers and agencies transform raw CSV/Excel data from Meta Ads, Google Ads, and TikTok Ads into professional, branded, and ready-to-send client reports in less than 5 minutes.

## Problem Solved
Digital marketing freelancers are required to create monthly reports for each client. Currently, they do this manually: export CSV from ad platforms, copy-paste to Google Slides or Canva, add charts one by one, and then send it to the client. This process takes 2-4 hours per client per month.

## Solution
Upload CSV → automated parsing system → select charts → add client branding → export branded PDF — done in 5 minutes.

## Feature List

## 1. Client Management
- Add, edit, archive clients
- Store client profile: name, logo, brand color (hex)
- Report history per client

## 2. Data Upload & Parsing
- Upload CSV and Excel (.xlsx) files
- Auto-detect columns and data types (number / text / date)
- Data preview before processing
- Support export formats from: Meta Ads, Google Ads, TikTok Ads

## 3. Chart Configuration
- Select chart type: Bar, Line, Pie, Donut
- Select X-axis (label) and Y-axis (value) from detected columns
- Date range filter
- Selection of KPI metrics to be displayed

## 4. Report Generation
- Automated KPIs: total, average, delta % vs previous period
- Charts with client brand colors
- Automated insights (AI-generated) (premium feature)
- Actionable recommendations for the next month (premium feature)

## 5. Branding & Export
- Upload client logo
- Select client brand color (color picker)
- Neat and professional A4 report template
- 1-click PDF export
- Share report link to client via WhatsApp

## Technical Architecture

- Backend     : Laravel 11
- Frontend    : React.js + Tailwind CSS
- REST API    : Axios Library
- Charts      : Chart.js or ApexCharts
- PDF Export  : Browser print + file system
- AI Insight  : Gemini API
- Database    : MySQL
- Server      : Hostinger Shared Hosting
- Auth        : Laravel Sanctum + JWT