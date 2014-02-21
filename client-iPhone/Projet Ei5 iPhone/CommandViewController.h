//
//  CommandViewController.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/10/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface CommandViewController : UIViewController<UITableViewDataSource,UITableViewDelegate>
@property (weak, nonatomic) IBOutlet UITextView *commandTextView;
@property (weak, nonatomic) IBOutlet UIActivityIndicatorView *activityIndicator;
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property NSMutableArray *arduinos;

- (IBAction)sendButton:(id)sender;
- (void)keyboardDidShow:(NSNotification *)note;
- (void)keyboardDone;

@end
