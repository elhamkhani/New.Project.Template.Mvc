-- ######################## Foreign Keys ######################################
ALTER TABLE PasswordResetTickets ADD Constraint
                [FK_PasswordResetTicket.User]
                FOREIGN KEY ([User])
                REFERENCES Users ([ID])
                ON DELETE NO ACTION 
GO
ALTER TABLE Administrators ADD CONSTRAINT 
[FK_Administrator.Id->User] FOREIGN KEY([Id]) 
REFERENCES Users ([Id])
 ON DELETE CASCADE


GO
