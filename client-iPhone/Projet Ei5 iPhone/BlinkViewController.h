//
//  BlinkControllerViewController.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface BlinkViewController : UIViewController<UITableViewDataSource,UITableViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property (weak, nonatomic) IBOutlet UITextField *pinNumberTextField;
@property (weak, nonatomic) IBOutlet UITextField *blinksNumberTextField;
@property (weak, nonatomic) IBOutlet UITextField *delayTextField;
@property NSMutableArray *arduinos;

- (IBAction)sendAction:(id)sender;

@end
