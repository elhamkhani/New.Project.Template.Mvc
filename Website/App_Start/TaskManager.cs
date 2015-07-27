using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Transactions;
using MSharp.Framework;
using MSharp.Framework.Data;
using MSharp.Framework.Mvc;
using MSharp.Framework.Services;
using Domain;

/// <summary>
/// Executes the scheduled tasks in independent threads automatically.
/// </summary>
public static partial class TaskManager
{
    static List<AutomatedTask> tasks = new List<AutomatedTask>();
    public static IEnumerable<AutomatedTask> Tasks { get { return tasks.ToArray(); } }
    
    /// <summary>
    /// Initialize all automated tasks.
    /// </summary>
    static TaskManager()
    {
        tasks.Add(new AutomatedTask(CleanOldTempUploads)
        {
            Name = "Clean old temp uploads",
            Intervals = TimeSpan.FromMinutes(10)
        });
        
        tasks.Add(new AutomatedTask(SendEmailQueueItems)
        {
            Name = "Send email queue items",
            Intervals = TimeSpan.FromSeconds(30)
        });
    }
    
    /// <summary>
    /// This will start the scheduled activities.
    /// It should be called once in Application_Start global event.
    /// </summary>
    public static void Run()
    {
        Tasks.Do(t => t.Start());
    }
    
    /// <summary>
    /// Clean old temp uploads
    /// </summary>
    static void CleanOldTempUploads(AutomatedTask info)
    {
        FileUploadService.DeleteTempFiles(olderThan: TimeSpan.FromHours(1));
    }
    
    /// <summary>
    /// Send email queue items
    /// </summary>
    static void SendEmailQueueItems(AutomatedTask info)
    {
        EmailService.SendAll();
    }
}