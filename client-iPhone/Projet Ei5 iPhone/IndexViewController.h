//
//  ViewController.h
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface IndexViewController : UIViewController<UITableViewDataSource,UITableViewDelegate>

@property (weak, nonatomic) IBOutlet UITableView *tableView;
@property NSMutableArray *arduinos;
@property (weak, nonatomic) IBOutlet UIBarButtonItem *editRestServerButton;


@end
