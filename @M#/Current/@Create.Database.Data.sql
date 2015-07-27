
-- ######################## ContentBlocks ######################################
INSERT [dbo].[ContentBlocks] ([Id], [Name], [Key], [Content]) VALUES (N'1237271a-b526-4fef-81e4-075c18c3c1c2', N'Password Successfully Reset', N'PasswordSuccessfullyReset', N'Your password has been successfully reset. ')

GO


-- ######################## EmailTemplates ######################################
INSERT [dbo].[EmailTemplates] ([Id], [Key], [Subject], [Body], [MandatoryPlaceholders]) VALUES (N'337a69a8-b057-492d-b92c-4cc29c57bfed', N'RecoverPassword', N'Recover Password', N'<p>Dear [#USERID#],</p>

<p>Please click on the following link to reset your password. If you did not request this password reset then please contact us.</p>

<div>  [#LINK#] </div>

<p><br />
Best regards,</p>

<p><br />
Regards</p>', N'USERID, LINK')

GO


-- ######################## Settings ######################################
INSERT [dbo].[Settings] ([Id], [Name], [PasswordResetTicketExpiryMinutes]) VALUES (N'f19f47bd-b41c-4c64-9d73-371e5f421830', N'Current', 120)

GO


-- ######################## Administrators ######################################
INSERT [dbo].[Administrators] ([Id], [ImpersonationToken], [Order]) VALUES (N'3536b2da-2e97-4627-bfc0-9036527b016b', NULL, 0)
INSERT [dbo].[Administrators] ([Id], [ImpersonationToken], [Order]) VALUES (N'89001798-6ddd-46f3-9e94-44f3695820eb', NULL, 0)

GO


-- ######################## Users ######################################
INSERT [dbo].[Users] ([Id], [FirstName], [LastName], [Email], [Password], [IsDeactivated], [Salt]) VALUES (N'3536b2da-2e97-4627-bfc0-9036527b016b', N'Geeks', N'Admin', N'admin@uat.co', N'S/9g0WHI4Td8L2O2IE1POIgZV74', 0, N'5a91f3e8-61ca-438a-85c5-737068760d33')
INSERT [dbo].[Users] ([Id], [FirstName], [LastName], [Email], [Password], [IsDeactivated], [Salt]) VALUES (N'89001798-6ddd-46f3-9e94-44f3695820eb', N'Joe', N'Admin', N'joe@uat.co', N'S/9g0WHI4Td8L2O2IE1POIgZV74', 0, N'5a51f3e8-61ca-438a-85c5-737068760d33')

GO

