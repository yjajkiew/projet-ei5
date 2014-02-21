//
//  ViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 11/29/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "IndexViewController.h"
#import "Arduino.h"

@interface IndexViewController ()

@end

@implementation IndexViewController

@synthesize tableView, editRestServerButton, activityIndicator, arduinos;

- (void)viewDidLoad
{
    [super viewDidLoad];
    
    //init view title in navigation bar
    [self.navigationItem setTitle:NSLocalizedString(@"app-title",nil)];
    
    arduinos = [[NSMutableArray alloc] init];
    tableView.dataSource = self;
    tableView.delegate = self;
    
    UIRefreshControl *refreshControl = [[UIRefreshControl alloc] init];
    [refreshControl setTintColor:[UIColor whiteColor]];
    refreshControl.attributedTitle = [[NSAttributedString alloc] initWithString:NSLocalizedString(@"pull-to-refresh",nil) attributes:@{NSForegroundColorAttributeName: [UIColor whiteColor],}];
    [refreshControl addTarget:self action:@selector(refresh:) forControlEvents:UIControlEventValueChanged];
    [self.tableView addSubview:refreshControl];
    
    [activityIndicator setHidden:YES];
    
    editRestServerButton.target = self;
    editRestServerButton.action = @selector(editRestServer:);
    
    [self fetchArduinosList];
    
}

- (void)refresh:(UIRefreshControl *)refreshControl {
    [self fetchArduinosList];
    [refreshControl endRefreshing];
}

-(void)fetchArduinosList {
    [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;
    [activityIndicator setHidden:NO];
    [activityIndicator startAnimating];
    
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
    NSOperationQueue *queue = [[NSOperationQueue alloc] init];
    [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
     {
         if([data length] > 0 && error == nil) {
             NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
             
             [self performSelectorOnMainThread:@selector(updateUIWithDictionary:) withObject:json waitUntilDone:YES];
             
         }
         else NSLog(@"error request arduino list");
         [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
         [self performSelectorOnMainThread:@selector(stopSpinning) withObject:nil waitUntilDone:NO];
     }];
}

-(void)stopSpinning {
    [activityIndicator stopAnimating];
    [activityIndicator setHidden:YES];
}

-(void)updateUIWithDictionary:(NSDictionary *)json {
    [arduinos removeAllObjects];
    NSArray *arrayArduinosJson = [json valueForKey:@"data"];
    for(NSDictionary *json in arrayArduinosJson) {
        Arduino *arduino = [[Arduino alloc] initWithJson:json];
        if (arduino != nil) [arduinos addObject:arduino];
        arduino = nil;
    }
    [tableView reloadData];
}

//define number of sections
- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView
{
    return 2;
}

//define number of rows for each section
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if(section == 0) return arduinos.count;
    else if(section == 1) return 4;
    else return 0;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if(section == 0) return NSLocalizedString(@"arduinos-title",nil);
    else if(section == 1) return NSLocalizedString(@"actions-title",nil);
    else return nil;
}

//change color of header titles
- (void)tableView:(UITableView *)tableView willDisplayHeaderView:(UIView *)view forSection:(NSInteger)section
{
    // Text Color
    UITableViewHeaderFooterView *header = (UITableViewHeaderFooterView *)view;
    [header.textLabel setTextColor:[UIColor whiteColor]];
    //background color
    /*
     UIView *selectionColor = [[UIView alloc] init];
    selectionColor.backgroundColor = UIColorFromRGB(0x067AB5);
    [header setBackgroundView:selectionColor];
     */
}

- (UITableViewCell *) tableView:(UITableView *)table cellForRowAtIndexPath:(NSIndexPath *)indexPath
{
    static NSString *cellIdentifier = @"cell";
    
    UITableViewCell *cell = [table dequeueReusableCellWithIdentifier:cellIdentifier];
    if (cell == nil) cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:cellIdentifier];
    
    cell.backgroundColor = [UIColor darkGrayColor];
    cell.textLabel.textColor = [UIColor lightGrayColor];
    
    //change color when cell selected
    UIView *selectionColor = [[UIView alloc] init];
    selectionColor.backgroundColor = UIColorFromRGB(0x067AB5);
    cell.selectedBackgroundView = selectionColor;
    
    //arduinos
    if(indexPath.section == 0) {
        cell.textLabel.text = ((Arduino*)[arduinos objectAtIndex:indexPath.row]).desc;
    }
    //actions
    if(indexPath.section == 1) {
        switch (indexPath.row) {
            case 0: cell.textLabel.text = NSLocalizedString(@"read-action",nil); break; //read
            case 1: cell.textLabel.text = NSLocalizedString(@"write-action",nil); break; //write
            case 2: cell.textLabel.text = NSLocalizedString(@"blink-action",nil); break; //blink
            case 3: cell.textLabel.text = NSLocalizedString(@"command-action",nil); break; //command
            default: break;
        }
    }

    return cell;
}

//Action when a cell is selected
- (void) tableView:(UITableView *)table didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    NSLog(@"%@", [NSString stringWithFormat:@"Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
    if ([table isEqual:tableView] && indexPath.section == 1) {
        switch (indexPath.row) {
            case 0:[self performSegueWithIdentifier:@"indexToRead" sender:NULL]; break; //read
            case 1:[self performSegueWithIdentifier:@"indexToWrite" sender:NULL]; break; //write
            case 2:[self performSegueWithIdentifier:@"indexToBlink" sender:NULL]; break; //blink
            case 3:[self performSegueWithIdentifier:@"indexToCommand" sender:NULL]; break; //command
            default: break;
        }
        
    }
}

-(void)editRestServer:(id)sender {
    UIAlertView *message = [[UIAlertView alloc] initWithTitle:NSLocalizedString(@"rest-server-title",nil)
                                                      message:nil
                                                     delegate:nil
                                            cancelButtonTitle:NSLocalizedString(@"cancel",nil)
                                            otherButtonTitles:NSLocalizedString(@"ok",nil),nil];
    message.alertViewStyle = UIAlertViewStylePlainTextInput;
    message.delegate = self;
    [[message textFieldAtIndex:0] setText:globalServerAddress];
    [[message textFieldAtIndex:0] setKeyboardAppearance:UIKeyboardAppearanceDark];
    [message show];
}

- (void)alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex
{
    NSString *title = [alertView buttonTitleAtIndex:buttonIndex];
    if([title isEqualToString:NSLocalizedString(@"ok",nil)])
    {
        NSLog(@"rest url changed");
        UITextField *url = [alertView textFieldAtIndex:0];
        //check if url is ok
        /*
         NSMutableURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
        NSOperationQueue *queue = [[NSOperationQueue alloc] init];
        [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
         {
             if([data length] > 0 && error == nil) {
                 [self performSelectorOnMainThread:@selector(checkRestServer:) withObject:url.text waitUntilDone:NO];
             }
             else {
                 NSLog(@"rest server not OK");
             }
         }];
        */
        globalServerAddress = url.text;
        [self fetchArduinosList];
    }
}

-(void)checkRestServer:(NSString*) url {
    globalServerAddress = url;
}


- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


@end
