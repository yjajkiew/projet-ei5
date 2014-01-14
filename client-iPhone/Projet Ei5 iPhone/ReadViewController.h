//
//  ReadViewController.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/10/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface ReadViewController : UIViewController<UITableViewDataSource,UITableViewDelegate>

@property (weak, nonatomic) IBOutlet UITextField *pinNumberTextField;
@property (weak, nonatomic) IBOutlet UISegmentedControl *modeSegmentedControl;
@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property NSMutableArray *arduinos;

- (IBAction)sendButton:(id)sender;

@end
