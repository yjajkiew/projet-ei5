//
//  ReadViewController.m
//  Projet Ei5 iPhone
//
//  Created by Yann Jajkiewicz on 12/10/13.
//  Copyright (c) 2013 Yann Jajkiewicz. All rights reserved.
//

#import "ReadViewController.h"
#import "ResponseViewController.h"
#import "Arduino.h"
#import "Response.h"

@interface ReadViewController ()

@end

@implementation ReadViewController

@synthesize pinNumberTextField, modeSegmentedControl, tableView, activityIndicator, arduinos;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
	
    //init view title in navigation bar
    [self.navigationItem setTitle:NSLocalizedString(@"read-title",nil)];
    
    arduinos = [[NSMutableArray alloc] init];
    
    tableView.delegate = self;
    tableView.dataSource = self;
    
    UIRefreshControl *refreshControl = [[UIRefreshControl alloc] init];
    [refreshControl setTintColor:[UIColor whiteColor]];
    refreshControl.attributedTitle = [[NSAttributedString alloc] initWithString:NSLocalizedString(@"pull-to-refresh",nil) attributes:@{NSForegroundColorAttributeName: [UIColor whiteColor],}];
    [refreshControl addTarget:self action:@selector(refresh:) forControlEvents:UIControlEventValueChanged];
    [self.tableView addSubview:refreshControl];
    
    [activityIndicator setHidden:YES];
    
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(keyboardDidShow:) name:UIKeyboardDidShowNotification object:nil];
    
    self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(keyboardDone)];
    [self.navigationItem.rightBarButtonItem setEnabled:NO];
    
    /*
    UIBarButtonItem *addAttachButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(keyboardDone)];
    
    UIBarButtonItem *sendButton = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemRefresh target:self action:@selector(fetchArduinosList)];
    
    self.navigationItem.rightBarButtonItems = @[addAttachButton,sendButton];
    */
    
    [self fetchArduinosList];
}

- (void)refresh:(UIRefreshControl *)refreshControl {
    [self fetchArduinosList];
    [refreshControl endRefreshing];
}

-(void)keyboardDidShow:(NSNotification *)note {
    [self.navigationItem.rightBarButtonItem setEnabled:YES];
}

-(void)keyboardDone {
    [self.view endEditing:YES];
    [self.navigationItem.rightBarButtonItem setEnabled:NO];
}

-(void)fetchArduinosList {
    [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;
    [activityIndicator setHidden:NO];
    [activityIndicator startAnimating];
    
    NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:[NSString stringWithFormat:@"%@/arduinos/", globalServerAddress]]];
    NSOperationQueue *queue = [[NSOperationQueue alloc] init];
    [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
     {
         if([data length] >0 && error == nil) {
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
    return 1;
}

//define number of rows for each section
- (NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section
{
    if(section == 0) return arduinos.count;
    else return 0;
}

-(NSString *)tableView:(UITableView *)tableView titleForHeaderInSection:(NSInteger)section {
    if(section == 0) return NSLocalizedString(@"select-arduino-input",nil);
    else return nil;
}

//change color of header titles
- (void)tableView:(UITableView *)tableView willDisplayHeaderView:(UIView *)view forSection:(NSInteger)section
{
    // Text Color
    UITableViewHeaderFooterView *header = (UITableViewHeaderFooterView *)view;
    [header.textLabel setTextColor:[UIColor whiteColor]];
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
    
    return cell;
}

//Action when a cell is selected
- (void) tableView:(UITableView *)table didSelectRowAtIndexPath:(NSIndexPath *)indexPath{
    NSLog(@"%@", [NSString stringWithFormat:@"Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
    if ([table isEqual:tableView] && indexPath.section == 0) {
        
    }
}

- (IBAction)sendButton:(id)sender {
    NSString *errorMessage = nil;
    NSIndexPath *indexPath = tableView.indexPathForSelectedRow;
    NSCharacterSet *numericOnly = [NSCharacterSet decimalDigitCharacterSet];
    
    //check if pin is not a empty number
    if(!pinNumberTextField.text.length || ![numericOnly isSupersetOfSet:[NSCharacterSet characterSetWithCharactersInString:pinNumberTextField.text]]) errorMessage = NSLocalizedString(@"pin-number-error",nil);
    //check if in analog mode pin number is between 0 and 5
    else if(modeSegmentedControl.selectedSegmentIndex == 1 && ([pinNumberTextField.text intValue] < 0 || [pinNumberTextField.text intValue] > 5)) errorMessage = NSLocalizedString(@"analog-pin-error",nil);
    //check if in binary mode pin number is between 1 and 13
    else if(modeSegmentedControl.selectedSegmentIndex == 0 && ([pinNumberTextField.text intValue] < 1 || [pinNumberTextField.text intValue] > 13)) errorMessage = NSLocalizedString(@"binary-pin-error",nil);
    //check if arduino is selected
    else if(indexPath == nil) errorMessage = NSLocalizedString(@"arduino-error",nil);
    
    //error => display alert
    if(errorMessage != nil) {
        UIAlertView *errorAlert = [[UIAlertView alloc] initWithTitle:NSLocalizedString(@"error-title",nil)
                                                             message:errorMessage
                                                            delegate:nil
                                                   cancelButtonTitle:NSLocalizedString(@"ok",nil)
                                                   otherButtonTitles:nil];
        [errorAlert show];
    }
    else {
        //deactivate send button because the request will be fired
        [(UIButton*)sender setEnabled:NO];
        
        NSLog(@"%@", [NSString stringWithFormat:@"Button: Cell %ld in Section %ld is selected",(long)indexPath.row, (long)indexPath.section]);
        Arduino *arduino = [arduinos objectAtIndex:indexPath.row];
        NSString *mode;
        if(modeSegmentedControl.selectedSegmentIndex == 1) mode = @"a";
        else mode = @"b";
        NSString *command = [NSString stringWithFormat:@"%@/arduinos/pinRead/%d/%@/%@/%@", globalServerAddress, 1, arduino.leId, pinNumberTextField.text,mode];
        NSLog(@"command: %@", command);
        
        [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;
        
        ///rest/arduinos/pinRead/192.168.2.3/192.168.2.3/9/a
        NSURLRequest *urlRequest = [NSURLRequest requestWithURL:[NSURL URLWithString:command]];
        NSOperationQueue *queue = [[NSOperationQueue alloc] init];
        [NSURLConnection sendAsynchronousRequest:urlRequest queue:queue completionHandler:^(NSURLResponse *response, NSData *data, NSError *error)
         {
             if([data length] > 0 && error == nil) {
                 NSDictionary *json = [NSJSONSerialization JSONObjectWithData:data options:NSJSONReadingAllowFragments error:nil];
                 Response *response = [[Response alloc]initWithJson:[json valueForKey:@"data"]];
                 NSLog(@"response received: %@", response);
                 [self performSelectorOnMainThread:@selector(showResponse:) withObject:response waitUntilDone:YES];
                 
             }
             else NSLog(@"error request arduino list");
             [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
         }];
        
    }
    
}

-(void)showResponse:(Response*)response {
    [self performSegueWithIdentifier:@"readToResponse" sender:response];
}

//change views
-(void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    //go to chapters' view
    if([segue.identifier isEqualToString:@"readToResponse"]) {
        ResponseViewController *responseVC = segue.destinationViewController;
        responseVC.response = (Response*)sender;
    }
}

//hide keyboard when user touches the screen outside of textfields
- (void)touchesBegan:(NSSet *)touches withEvent:(UIEvent *)event {
    
    UITouch *touch = [[event allTouches] anyObject];
    
    if (![[touch view] isKindOfClass:[UITextField class]]) {
        [self.view endEditing:YES];
        [self.navigationItem.rightBarButtonItem setEnabled:NO];
    }
    [super touchesBegan:touches withEvent:event];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
